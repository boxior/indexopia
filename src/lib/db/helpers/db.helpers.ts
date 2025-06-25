import {readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {DbItems} from "@/lib/db/db.types";
import {
    Asset,
    AssetHistory,
    AssetWithHistoryAndOverview,
    AssetWithHistoryOverviewPortionAndMaxDrawDown,
    HistoryOverview,
    Id,
    Index,
    IndexHistory,
    IndexOverview,
    NormalizedAssetHistory,
    NormalizedAssets,
} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
import {MAX_ASSETS_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import {cloneDeep, flatten, get, pick, set} from "lodash";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";

import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";
import {dbGetAssetHistoryById, dbGetAssetHistoryByIdAndStartTime} from "@/lib/db/helpers/db.assetsHistory.helpers";
import {dbGetIndexOverviewById} from "@/lib/db/helpers/db.indexOverview.helpers";

export const ASSETS_FOLDER_PATH = "/db/assets";
export const INDEXES_FOLDER_PATH = "/db/indexes";
export const ASSETS_HISTORY_FOLDER_PATH = "/db/assets_history";

/**
 * Taking the last day from existed item, not the current last day as sometimes, it might be lack of data due to populating progress that we make regularly once per day.
 * Look at /populate API request where we fetch up-to-date top assets and their histories and all other assets that were fetched before as top ones.
 */
export const getAssetHistoryOverview = async (
    id: string,
    historyListProp?: AssetHistory[]
): Promise<HistoryOverview> => {
    const history = historyListProp ?? (await dbGetAssetHistoryById(id));
    const historyList = history ?? [];

    const lastDayItem = historyList[historyList.length - 1];
    const lastDay = lastDayItem?.time;

    const oneDayAgo = historyList.find(
        item => item.time === momentTimeZone.tz(lastDay, "UTC").startOf("day").add(-1, "day").valueOf()
    );
    const sevenDaysAgo = historyList.find(
        item => item.time === momentTimeZone.tz(lastDay, "UTC").startOf("day").add(-7, "day").valueOf()
    );
    const thirtyDaysAgo = historyList.find(
        item => item.time === momentTimeZone.tz(lastDay, "UTC").startOf("day").add(-30, "day").valueOf()
    );

    const days1Profit = Number(lastDayItem?.priceUsd) - Number(oneDayAgo?.priceUsd);
    const days1ProfitPercent = days1Profit / Number(oneDayAgo?.priceUsd);

    const days7Profit = Number(lastDayItem?.priceUsd) - Number(sevenDaysAgo?.priceUsd);
    const days7ProfitPercent = days7Profit / Number(sevenDaysAgo?.priceUsd);

    const days30Profit = Number(lastDayItem?.priceUsd) - Number(thirtyDaysAgo?.priceUsd);
    const days30ProfitPercent = days30Profit / Number(thirtyDaysAgo?.priceUsd);

    const totalProfit = Number(lastDayItem?.priceUsd) - Number(historyList[0]?.priceUsd);
    const totalProfitPercent = totalProfit / Number(historyList[0]?.priceUsd);

    return {
        days1: days1ProfitPercent,
        days7: days7ProfitPercent,
        days30: days30ProfitPercent,
        total: totalProfitPercent,
    };
};

export const getCachedTopAssets = async (limit: number | undefined = MAX_ASSETS_COUNT): Promise<Asset[]> => {
    const assets = await dbGetAssets();
    return filterAssetsByOmitIds(assets ?? [], limit);
};

export const getCachedAssets = async (ids: string[]): Promise<Asset[]> => {
    const assets = await dbGetAssets();
    return (assets ?? []).filter(asset => ids.includes(asset.id));
};

export const getIndexHistoryOverview = async <A extends {id: string; portion?: number} = Asset>({
    id,
    name,
    assets,
}: {
    id?: Id;
    name?: string;
    assets: AssetWithHistoryAndOverview<A>[];
}): Promise<HistoryOverview> => {
    // Read all assets
    if (assets.length === 0) {
        return {days1: 0, days7: 0, days30: 0, total: 0};
    }

    // Extract portions from the index assets
    const portions = assets.map(asset => asset.portion ?? 0);

    // Ensure portions sum to 100%
    const portionSum = portions.reduce((sum, portion) => sum + portion, 0);
    if (Math.abs(portionSum - 100) > 1e-8) {
        throw new Error(
            `Asset portions must sum to 100%. id: ${id}; name: ${name}; portions: ${portions}; portionSum: ${portionSum}`
        );
    }

    // Initialize cumulative weighted performance variables
    let weightedDays1 = 0;
    let weightedDays7 = 0;
    let weightedDays30 = 0;
    let weightedTotal = 0;

    for (const asset of assets) {
        try {
            const assetHistoryOverview = asset.historyOverview;

            const weight = (asset.portion ?? 0) / 100; // Convert portion to weight

            // Accumulate weighted values
            weightedDays1 += assetHistoryOverview.days1 * weight;
            weightedDays7 += assetHistoryOverview.days7 * weight;
            weightedDays30 += assetHistoryOverview.days30 * weight;
            weightedTotal += assetHistoryOverview.total * weight;
        } catch (error) {
            console.error(`Failed to calculate history overview for asset ${asset.id}`, error);
        }
    }

    // Return the weighted results
    return {
        days1: weightedDays1,
        days7: weightedDays7,
        days30: weightedDays30,
        total: weightedTotal,
    };
};

export const getAssetHistoriesWithSmallestRange = async ({
    assetIds,
    startTime,
    endTime,
    normalizedAssetsHistory,
}: {
    assetIds: string[];
    startTime?: number;
    endTime?: number;
    normalizedAssetsHistory?: Record<string, AssetHistory[]>;
}): Promise<{histories: Record<string, AssetHistory[]>; startTime?: number; endTime?: number}> => {
    const histories: Record<string, AssetHistory[]> = {};

    let minStartTime: number | null = startTime ?? null;
    let maxEndTime: number | null = endTime ?? null;

    const historyRecord =
        normalizedAssetsHistory ??
        flatten(
            await Promise.all(
                assetIds.map(assetId => {
                    return (async () => {
                        try {
                            return startTime
                                ? dbGetAssetHistoryByIdAndStartTime(assetId, startTime)
                                : dbGetAssetHistoryById(assetId);
                        } catch {
                            return [];
                        }
                    })();
                })
            )
        ).reduce(
            (acc, assetHistory) => {
                return {
                    ...acc,
                    [assetHistory.assetId]: [...(acc[assetHistory.assetId] ?? []), assetHistory],
                };
            },
            {} as Record<string, AssetHistory[]>
        );

    // Step 1: Read the history for each asset and determine the smallest start time

    for (const assetId of assetIds) {
        try {
            const historyData = historyRecord[assetId] ?? [];

            const historyList = historyData ?? [];

            if (!historyList.length) {
                histories[assetId] = []; // No data for this asset
                continue;
            }

            // Determine this asset's start and end times
            const assetStartTime = Math.min(...historyList.map(item => item.time));
            const assetEndTime = Math.max(...historyList.map(item => item.time));

            // Update the global minimum for start time, taking the latest overlapping start time
            minStartTime = minStartTime === null ? assetStartTime : Math.max(minStartTime, assetStartTime);

            // Update the global maximum for end time, taking the earliest overlapping end time
            maxEndTime = maxEndTime === null ? assetEndTime : Math.min(maxEndTime, assetEndTime);

            histories[assetId] = historyList;
        } catch (error) {
            console.error(`Error reading history for asset ID ${assetId}:`, error);
            histories[assetId] = []; // Handle error gracefully
        }
    }

    // Step 3: Filter each asset's history to align with the calculated range
    for (const assetId of assetIds) {
        histories[assetId] = histories[assetId].filter(item => {
            const withinStart = minStartTime === null || item.time >= minStartTime;
            const withinEnd = maxEndTime === null || item.time <= maxEndTime;
            return withinStart && withinEnd;
        });
    }

    return {histories, startTime: minStartTime ?? undefined, endTime: maxEndTime ?? undefined};
};

export const getIndexHistory = async <A extends {id?: Id; portion?: number}>(index: {
    id?: Id;
    name: string;
    assets: AssetWithHistoryAndOverview<A>[];
}): Promise<IndexHistory[]> => {
    const portions = index.assets.map(asset => asset.portion ?? 0);

    return mergeAssetHistories(
        index.assets.map(a => a.history),
        portions,
        index
    );
};

function mergeAssetHistories<A = Asset>(
    histories: AssetHistory[][],
    portions: number[],
    index: {id?: Id; name: string; assets: AssetWithHistoryAndOverview<A>[]}
): IndexHistory[] {
    if (histories.length === 0 || histories[0].length === 0) {
        return [];
    }

    if (histories.length !== portions.length) {
        throw new Error("The number of histories must match the number of portions");
    }

    // Ensure all portions sum to 100%
    const portionSum = portions.reduce((sum, portion) => sum + portion, 0);
    if (Math.abs(portionSum - 100) > 1e-8) {
        console.error("Portions must sum up to 100%", index.id, index.name);

        return [];
    }

    const arrayLength = histories[0].length;

    // Ensure all histories have the same length
    if (!histories.every(history => history.length === arrayLength)) {
        writeJsonFile("histories[][]", histories, "/db/debug");
        console.error("All histories must have the same length");
        return [];

        // throw new Error("All histories must have the same length");
    }

    const merged: IndexHistory[] = [];

    for (let i = 0; i < arrayLength; i++) {
        const currentElements = histories.map(historyArray => historyArray[i]);

        // Since we assume time and date are the same across arrays, pick them from the first array
        const {time, date} = currentElements[0];

        // Compute the weighted average price based on portions
        const weightedAveragePrice = currentElements
            .reduce((sum, assetHistory, index) => {
                const weight = portions[index] / 100; // Convert portion to a multiplier
                return sum + parseFloat(assetHistory.priceUsd) * weight;
            }, 0)
            .toFixed(20); // Ensure fixed precision

        merged.push({
            time,
            date,
            priceUsd: weightedAveragePrice,
        });
    }

    return merged;
}

export const getIndex = async ({
    id,
    indexOverview: propIndexOverview,
}: {
    id: Id;
    indexOverview?: IndexOverview;
}): Promise<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null> => {
    const indexOverview = propIndexOverview ?? (await dbGetIndexOverviewById(id));

    if (!indexOverview) {
        return null;
    }

    let assets = await getCachedAssets(indexOverview.assets.map(asset => asset.id));

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets,
        ...pick(indexOverview, ["startTime"]),
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: indexOverview.assets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index: Omit<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>, "historyOverview" | "maxDrawDown"> = {
        ...indexOverview,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        history: [],
    };

    const indexHistory = await getIndexHistory(index);
    const indexHistoryOverview = await getIndexHistoryOverview(index);
    const indexMaxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        ...index,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        startTime: startTime ?? performance.now(),
        endTime,
        history: indexHistory,
        historyOverview: indexHistoryOverview,
        maxDrawDown: indexMaxDrawDown,
    };
};

export async function getAssetsWithHistories<A extends {id: string} = Asset>({
    assets,
    startTime: startTimeProp,
    endTime: endTimeProp,
    normalizedAssetsHistory,
}: {
    assets: A[];
    startTime?: number;
    endTime?: number;
    normalizedAssetsHistory?: Record<string, AssetHistory[]>;
}): Promise<{assets: AssetWithHistoryAndOverview<A>[]; startTime?: number; endTime?: number}> {
    const {histories, startTime, endTime} = await getAssetHistoriesWithSmallestRange({
        assetIds: assets.map(asset => asset.id),
        startTime: startTimeProp,
        endTime: endTimeProp,
        normalizedAssetsHistory,
    });

    const assetsHistoriesOverviews: HistoryOverview[] = await Promise.all(
        assets.map(asset => getAssetHistoryOverview(asset.id, histories[asset.id]))
    );

    return {
        assets: assets.map((asset, index) => ({
            ...asset,
            history: histories[asset.id],
            historyOverview: assetsHistoriesOverviews[index],
        })),
        startTime,
        endTime,
    };
}

export function filterAssetsByOmitIds(assets: Asset[], limit: number | undefined = assets.length): Asset[] {
    return assets
        .slice(0, limit + OMIT_ASSETS_IDS.length)
        .filter(a => !OMIT_ASSETS_IDS.includes(a.id))
        .slice(0, limit);
}

export const normalizeDbBoolean = <Input extends Record<string, unknown>, Output>(
    entity: Input,
    keys: string[]
): Output => {
    const clonedEntity = cloneDeep(entity);

    for (const key of keys) {
        set(clonedEntity, key, Boolean(get(clonedEntity, key)));
    }
    return clonedEntity as unknown as Output;
};

const fulfillAssetHistory = (history: AssetHistory[]): AssetHistory[] => {
    // Early return if the history is empty or has only one entry
    if (history.length <= 1) {
        return history;
    }

    // Sort the history array by time in ascending order to handle out-of-order data
    const sortedHistory = [...history].sort((a, b) => a.time - b.time);

    const fulfilledHistory: AssetHistory[] = [sortedHistory[0]];

    // Iterate through sorted history and detect gaps
    for (let i = 1; i < sortedHistory.length; i++) {
        const previous = fulfilledHistory[fulfilledHistory.length - 1];
        const current = sortedHistory[i];

        // Get the UTC start of the day for current and previous entries
        const previousDayStart = momentTimeZone.tz(previous.time, "UTC").startOf("day");
        const currentDayStart = momentTimeZone.tz(current.time, "UTC").startOf("day");

        // Calculate the difference in days
        let dayDifference = currentDayStart.diff(previousDayStart, "days");

        // Fill gaps with cloned entries
        while (dayDifference > 1) {
            const newEntry = {...previous}; // Clone the previous record
            const nextDay = previousDayStart.add(1, "day"); // Move to the next day

            // Update the time and date fields
            newEntry.time = nextDay.valueOf();
            newEntry.date = nextDay.toISOString();

            // Add the new entry to the fulfilled history
            fulfilledHistory.push(newEntry);

            // Decrease the day difference counter
            dayDifference--;
        }

        // Add the current entry to the fulfilled history
        fulfilledHistory.push(current);
    }

    return fulfilledHistory;
};

export const normalizeAssets = async (): Promise<NormalizedAssets> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = assets?.data ?? [];

    const normalizedAssets: NormalizedAssets = {};

    for (const asset of assetsList) {
        if (asset.id) {
            normalizedAssets[asset.id] = asset;
        }
    }

    return normalizedAssets;
};

export const normalizeAssetsHistory = async (): Promise<NormalizedAssetHistory> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = assets?.data ?? [];

    const normalizedAssetHistory: NormalizedAssetHistory = {};

    for (const asset of assetsList) {
        if (asset.id) {
            const history = (await readJsonFile(
                `asset_${asset.id}_history`,
                {},
                ASSETS_HISTORY_FOLDER_PATH
            )) as DbItems<AssetHistory>;
            const historyList = history?.data ?? [];

            normalizedAssetHistory[asset.id] = historyList;
        }
    }

    return normalizedAssetHistory;
};
