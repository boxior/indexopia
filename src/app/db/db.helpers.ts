import {processAllFilesInFolder, readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import fetchAssetHistory from "@/app/actions/assets/fetchAssetHistory";
import {DbItems} from "@/app/db/db.types";
import {
    Asset,
    AssetHistory,
    AssetWithHistoryAndOverview,
    AssetWithHistoryOverviewPortionAndMaxDrawDown,
    CustomIndexType,
    Index,
    IndexId,
    NormalizedAssetHistory,
    NormalizedAssets,
} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
import {
    ASSET_COUNT_BY_INDEX_ID,
    INDEX_NAME_BY_INDEX_ID,
    MAX_ASSET_COUNT,
    OMIT_ASSETS_IDS,
} from "@/utils/constants/general.constants";
import {pick} from "lodash";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {insertAssets, queryAssets} from "@/lib/db";

export const ASSETS_FOLDER_PATH = "/db/assets";
export const INDEXES_FOLDER_PATH = "/db/indexes";
export const ASSETS_HISTORY_FOLDER_PATH = "/db/assets_history";

export const handleGetAssets = async ({limit}: {limit?: number}): Promise<Asset[]> => {
    const {data} = await fetchAssets({limit});

    await insertAssets(data);

    return data;
};

const handleGetAssetHistory = async ({id}: {id: string}): Promise<AssetHistory[]> => {
    const fileName = `asset_${id}_history`;
    const oldData = await readJsonFile(fileName, {}, ASSETS_HISTORY_FOLDER_PATH);
    const oldList = fulfillAssetHistory((oldData as any)?.data ?? []);

    let start = momentTimeZone.tz("UTC").startOf("day").add(-11, "year").add(1, "day").valueOf();

    if (oldList.length > 0) {
        start = momentTimeZone
            .tz(oldList[oldList.length - 1].time, "UTC")
            .startOf("day")
            .add(1, "day")
            .valueOf();
    }

    const end = momentTimeZone.tz("UTC").startOf("day").valueOf();

    if (start === end) {
        return oldList;
    }

    const {data: newData} = await fetchAssetHistory({
        interval: "d1",
        start,
        end,
        id,
    });

    const newList = (newData as any).data ?? [];

    if (newList.length === 0) {
        return oldList;
    }

    const data = fulfillAssetHistory([...oldList, ...newList]);
    await writeJsonFile(fileName, {data}, ASSETS_HISTORY_FOLDER_PATH);

    return data;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const manageAllAssetsHistories = async (upToRank: number | undefined = MAX_ASSET_COUNT) => {
    const assets = await queryAssets();
    const assetsList = filterAssetsByOmitIds(assets, upToRank);

    for (const asset of assetsList) {
        try {
            await handleGetAssetHistory({id: asset.id});
        } catch (err) {
            console.error(err);
            await writeJsonFile(`error_${(err as Error).name}`, JSON.parse(JSON.stringify(err)), `/db/errors`);
        }
    }
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

export type HistoryOverview = {
    days1: number;
    days7: number;
    total: number;
};
export const getAssetHistoryOverview = async (
    id: string,
    historyListProp?: AssetHistory[]
): Promise<HistoryOverview> => {
    const history = historyListProp
        ? {data: historyListProp}
        : ((await readJsonFile(`asset_${id}_history`, {}, ASSETS_HISTORY_FOLDER_PATH)) as DbItems<AssetHistory>);

    const historyList = history?.data ?? [];

    const lastDay = momentTimeZone.tz("UTC").startOf("day").add(-1, "day").valueOf();
    const lastDayItem = historyList.find(item => item.time === lastDay);
    const oneDayAgo = historyList.find(
        item => item.time === momentTimeZone.tz(lastDay, "UTC").startOf("day").add(-1, "day").valueOf()
    );
    const sevenDaysAgo = historyList.find(
        item => item.time === momentTimeZone.tz(lastDay, "UTC").startOf("day").add(-7, "day").valueOf()
    );

    const days1Profit = Number(lastDayItem?.priceUsd) - Number(oneDayAgo?.priceUsd);
    const days1ProfitPercent = days1Profit / Number(oneDayAgo?.priceUsd);

    const days7Profit = Number(lastDayItem?.priceUsd) - Number(sevenDaysAgo?.priceUsd);
    const days7ProfitPercent = days7Profit / Number(sevenDaysAgo?.priceUsd);

    const totalProfit = Number(lastDayItem?.priceUsd) - Number(historyList[0]?.priceUsd);
    const totalProfitPercent = totalProfit / Number(historyList[0]?.priceUsd);

    return {
        days1: days1ProfitPercent,
        days7: days7ProfitPercent,
        total: totalProfitPercent,
    };
};

export const getCachedTopAssets = async (limit: number): Promise<Asset[]> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    return filterAssetsByOmitIds(assets?.data ?? [], limit);
};

export const getCachedAssets = async (ids: string[]): Promise<Asset[]> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    return (assets?.data ?? []).filter(asset => ids.includes(asset.id));
};

export const getIndexHistoryOverview = async (
    index: Omit<Index<AssetWithHistoryAndOverview>, "historyOverview" | "maxDrawDown">
): Promise<HistoryOverview> => {
    // Read all assets
    const indexAssets = index.assets;

    if (indexAssets.length === 0) {
        return {days1: 0, days7: 0, total: 0};
    }

    // Extract portions from the index assets
    const portions = indexAssets.map(asset => asset.portion ?? 0);

    // Ensure portions sum to 100%
    const portionSum = portions.reduce((sum, portion) => sum + portion, 0);
    if (Math.abs(portionSum - 100) > 1e-8) {
        throw new Error("Asset portions must sum to 100%");
    }

    // Initialize cumulative weighted performance variables
    let weightedDays1 = 0;
    let weightedDays7 = 0;
    let weightedTotal = 0;

    for (const asset of indexAssets) {
        try {
            const assetHistoryOverview = asset.historyOverview;

            const weight = (asset.portion ?? 0) / 100; // Convert portion to weight

            // Accumulate weighted values
            weightedDays1 += assetHistoryOverview.days1 * weight;
            weightedDays7 += assetHistoryOverview.days7 * weight;
            weightedTotal += assetHistoryOverview.total * weight;
        } catch (error) {
            console.error(`Failed to calculate history overview for asset ${asset.id}`, error);
        }
    }

    // Return the weighted results
    return {
        days1: weightedDays1,
        days7: weightedDays7,
        total: weightedTotal,
    };
};

export const getAssetHistoriesWithSmallestRange = async ({
    assetIds,
    startTime,
    endTime,
}: {
    assetIds: string[];
    startTime?: number;
    endTime?: number;
}): Promise<{histories: Record<string, AssetHistory[]>; startTime?: number; endTime?: number}> => {
    const histories: Record<string, AssetHistory[]> = {};

    let minStartTime: number | null = startTime ?? null;
    let maxEndTime: number | null = endTime ?? null;

    // Step 1: Read the history for each asset and determine the smallest start time
    for (const assetId of assetIds) {
        const historyFileName = `asset_${assetId}_history`;
        try {
            const historyData = (await readJsonFile(
                historyFileName,
                {},
                ASSETS_HISTORY_FOLDER_PATH
            )) as DbItems<AssetHistory>;

            const historyList = historyData?.data ?? [];

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

export const getIndexHistory = async (
    index: Omit<Index<AssetWithHistoryAndOverview>, "historyOverview" | "maxDrawDown">
): Promise<AssetHistory[]> => {
    const portions = index.assets.map(asset => asset.portion ?? 0);

    return mergeAssetHistories(
        index.assets.map(a => a.history),
        portions
    );
};

function mergeAssetHistories(histories: AssetHistory[][], portions: number[]): AssetHistory[] {
    if (histories.length === 0 || histories[0].length === 0) {
        return [];
    }

    if (histories.length !== portions.length) {
        throw new Error("The number of histories must match the number of portions");
    }

    // Ensure all portions sum to 100%
    const portionSum = portions.reduce((sum, portion) => sum + portion, 0);
    if (Math.abs(portionSum - 100) > 1e-8) {
        throw new Error("Portions must sum up to 100%");
    }

    const arrayLength = histories[0].length;

    // Ensure all histories have the same length
    if (!histories.every(history => history.length === arrayLength)) {
        throw new Error("All histories must have the same length");
    }

    const merged: AssetHistory[] = [];

    for (let i = 0; i < arrayLength; i++) {
        const currentElements = histories.map(historyArray => historyArray[i]);

        // Since we assume time and date are the same across arrays, pick them from the first array
        const {time, date} = currentElements[0];

        // Compute the weighted average price based on portions
        const weightedAveragePrice = currentElements
            .reduce((sum, asset, index) => {
                const weight = portions[index] / 100; // Convert portion to a multiplier
                return sum + parseFloat(asset.priceUsd) * weight;
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

export async function getIndex({
    id,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    id: IndexId;
    startTime?: number;
    endTime?: number;
}): Promise<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>> {
    let assets = await getCachedTopAssets(ASSET_COUNT_BY_INDEX_ID[id]);

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets,
        startTime: startTimeProp,
        endTime: endTimeProp,
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: Math.trunc(100 / ASSET_COUNT_BY_INDEX_ID[id]),
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index: Omit<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>, "historyOverview" | "maxDrawDown"> = {
        id,
        name: INDEX_NAME_BY_INDEX_ID[id],
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        history: [],
    };

    const indexHistory = await getIndexHistory(index);
    const indexHistoryOverview = await getIndexHistoryOverview(index);
    const indexMaxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        ...index,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        startTime,
        endTime,
        history: indexHistory,
        historyOverview: indexHistoryOverview,
        maxDrawDown: indexMaxDrawDown,
    };
}

export async function getCustomIndex({
    id,
}: {
    id: string;
}): Promise<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>> {
    const customIndex = (await readJsonFile(id, {}, INDEXES_FOLDER_PATH)) as CustomIndexType;
    let assets = await getCachedAssets(customIndex.assets.map(asset => asset.id));

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories({
        assets,
        ...pick(customIndex, ["startTime"]),
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: customIndex.assets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index: Omit<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>, "historyOverview" | "maxDrawDown"> = {
        ...pick(customIndex, ["id", "name", "startTime"]),
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        history: [],
    };

    const indexHistory = await getIndexHistory(index);
    const indexHistoryOverview = await getIndexHistoryOverview(index);
    const indexMaxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        ...index,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
        startTime,
        endTime,
        history: indexHistory,
        historyOverview: indexHistoryOverview,
        maxDrawDown: indexMaxDrawDown,
    };
}

export async function getCustomIndexes(): Promise<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>[]> {
    const cachedCustomIndexes = (await processAllFilesInFolder("/db/indexes")) as unknown as CustomIndexType[];

    return Promise.all(cachedCustomIndexes.map(ci => getCustomIndex({id: ci.id})));
}

async function getAssetsWithHistories({
    assets,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    assets: Asset[];
    startTime?: number;
    endTime?: number;
}): Promise<{assets: AssetWithHistoryAndOverview[]; startTime?: number; endTime?: number}> {
    const {histories, startTime, endTime} = await getAssetHistoriesWithSmallestRange({
        assetIds: assets.map(asset => asset.id),
        startTime: startTimeProp,
        endTime: endTimeProp,
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

function filterAssetsByOmitIds(assets: Asset[], limit: number): Asset[] {
    return assets
        .slice(0, limit + OMIT_ASSETS_IDS.length)
        .filter(a => !OMIT_ASSETS_IDS.includes(a.id))
        .slice(0, limit);
}
