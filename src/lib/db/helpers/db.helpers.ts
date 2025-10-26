import {readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {DbItems} from "@/lib/db/db.types";
import {
    Asset,
    AssetHistory,
    AssetWithHistoryAndOverview,
    AssetWithHistoryOverviewAndPortion,
    HistoryOverview,
    Id,
    IndexHistory,
    NormalizedAssetHistory,
    NormalizedAssets,
    RawAssetHistory,
} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
import {MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import {cloneDeep, flatten, get, set} from "lodash";

import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";
import {dbGetAssetHistoryById, dbGetAssetHistoryByIdAndStartTime} from "@/lib/db/helpers/db.assetsHistory.helpers";
import moment from "moment";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";

export const ASSETS_FOLDER_PATH = "/db/assets";
export const INDICES_FOLDER_PATH = "/db/indices";
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

    return getHistoryOverview(historyList);
};

export const getCachedTopAssets = async (
    limit: number | undefined = MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES
): Promise<Asset[]> => {
    const assets = await dbGetAssets();
    return filterAssetsByOmitIds(assets ?? [], limit);
};

// previous logic. It was inconsistency with the Index overview by assets overview.
export const getIndexHistoryOverviewByAssetsOverview = <A extends {id: string; portion?: number} = Asset>({
    id,
    name,
    assets,
}: {
    id?: Id;
    name?: string;
    assets: AssetWithHistoryOverviewAndPortion<A>[];
}): HistoryOverview => {
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

export const getHistoryOverview = (historyList: IndexHistory[]): HistoryOverview => {
    const lastDayItem = historyList[historyList.length - 1];

    const oneDayAgo = historyList.slice(-2)[0];
    const sevenDaysAgo = historyList.slice(-8)[0];
    const thirtyDaysAgo = historyList.slice(-31)[0];

    const days1Profit = parseFloat(lastDayItem?.priceUsd) - parseFloat(oneDayAgo?.priceUsd);
    const days1ProfitPercent = (days1Profit / parseFloat(oneDayAgo?.priceUsd)) * 100;

    const days7Profit = parseFloat(lastDayItem?.priceUsd) - parseFloat(sevenDaysAgo?.priceUsd);
    const days7ProfitPercent = (days7Profit / parseFloat(sevenDaysAgo?.priceUsd)) * 100;

    const days30Profit = parseFloat(lastDayItem?.priceUsd) - parseFloat(thirtyDaysAgo?.priceUsd);
    const days30ProfitPercent = (days30Profit / parseFloat(thirtyDaysAgo?.priceUsd)) * 100;

    const totalProfit = parseFloat(lastDayItem?.priceUsd) - parseFloat(historyList[0]?.priceUsd);
    const totalProfitPercent = (totalProfit / parseFloat(historyList[0]?.priceUsd)) * 100;

    return {
        days1: days1ProfitPercent,
        days7: days7ProfitPercent,
        days30: days30ProfitPercent,
        total: totalProfitPercent,
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
    let minStartTimeAssetId: string | null = null;

    let maxEndTime: number | null = endTime ?? null;
    let maxEndTimeAssetId: string | null = null;

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
            minStartTimeAssetId = minStartTime === assetStartTime ? assetId : minStartTimeAssetId;
            // Update the global maximum for end time, taking the earliest overlapping end time
            maxEndTime = maxEndTime === null ? assetEndTime : Math.min(maxEndTime, assetEndTime);
            maxEndTimeAssetId = maxEndTime === assetEndTime ? assetId : maxEndTimeAssetId;

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

    void writeJsonFile(
        `${assetIds.length}_${moment(maxEndTime).diff(moment(minStartTime), "d")}_${generateUuid()}`,
        {
            minStartTimeAssetId,
            maxEndTimeAssetId,
            minStartTime: moment(minStartTime).utc().toISOString(),
            maxEndTime: moment(maxEndTime).utc().toISOString(),
        },
        "/db/asset_history_with_smallest_range"
    );
    return {histories, startTime: minStartTime ?? undefined, endTime: maxEndTime ?? undefined};
};

function mergeAssetHistoriesFromPrev<A = Asset>(
    histories: AssetHistory[][],
    portions: number[],
    index: {id?: Id; name: string; assets: AssetWithHistoryAndOverview<A>[]},
    startingBalance: number | undefined = 1000
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
        console.error("Portions must sum up to 100%", portionSum, index.id, index.name);

        return [];
    }

    const arrayLength = histories[0].length;

    // Ensure all histories have the same length
    if (!histories.every(history => history.length === arrayLength)) {
        void writeJsonFile("histories[][]", histories, "/db/debug");
        console.error("All histories must have the same length");
        return [];
    }

    const merged: IndexHistory[] = [];

    const getElementsPerformance = (prevElements: AssetHistory[], elements: AssetHistory[]) => {
        return elements.reduce((acc, el, i) => {
            const prevElement = prevElements[i];

            // in percent
            const performance =
                ((parseFloat(el.priceUsd) - parseFloat(prevElement.priceUsd)) / parseFloat(prevElement.priceUsd)) * 100;
            return [...acc, performance];
        }, [] as number[]);
    };

    for (let i = 0; i < arrayLength; i++) {
        const prevElements = histories.map(historyArray => historyArray[i - 1]);
        const currentElements = histories.map(historyArray => historyArray[i]);
        // Since we assume time and date are the same across arrays, pick them from the first array
        const {time, date} = currentElements[0];

        if (i === 0) {
            merged.push({
                time,
                date,
                priceUsd: startingBalance.toFixed(20),
            });
            continue;
        }

        const prevPrice = parseFloat(merged[i - 1]?.priceUsd) || startingBalance;
        // Compute the weighted average price based on portions
        const weightedAveragePrice = currentElements.reduce((sum, assetHistory, elIndex) => {
            const weight = portions[elIndex] / 100; // Convert portion to a multiplier

            const elementPerformance = getElementsPerformance(prevElements, currentElements)[elIndex];
            const performance = elementPerformance / 100;

            return sum + prevPrice * performance * weight;
        }, 0);

        merged.push({
            time,
            date,
            priceUsd: (prevPrice + weightedAveragePrice).toFixed(20),
        });
    }

    return merged;
}

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

// Helper function to compare prices with configurable precision in percentage
export function arePricesSimilar(
    price1: Asset["priceUsd"] | null,
    price2: Asset["priceUsd"] | null,
    precisionPercent: number = 5 // default 5% precision
): boolean {
    if (!price1 || !price2) return false;

    const numPrice1 = parseFloat(price1);
    const numPrice2 = parseFloat(price2);

    if (isNaN(numPrice1) || isNaN(numPrice2)) return false;

    // Avoid division by zero
    if (numPrice1 === 0 && numPrice2 === 0) return true;
    if (numPrice1 === 0 || numPrice2 === 0) return false;

    // Calculate percentage difference relative to the higher price
    const maxPrice = Math.max(numPrice1, numPrice2);
    const priceDifference = Math.abs(numPrice1 - numPrice2);
    const percentageDifference = (priceDifference / maxPrice) * 100;

    return percentageDifference <= precisionPercent;
}

// New function to filter out duplicate symbols, keeping only the first occurrence
export function filterDuplicateAssetsBySymbol(propAssets: Asset[]): {
    assets: Asset[];
    duplicates: Record<string, string[]>;
} {
    const seenAssets: Asset[] = [];

    const duplicates: Record<string, string[]> = {};

    const assets = propAssets.filter(asset => {
        let duplicatedSymbol: Asset["symbol"] | null = null;

        seenAssets.forEach(seenAsset => {
            if (
                seenAsset.symbol.length > 1 &&
                asset.symbol.includes(seenAsset.symbol) &&
                arePricesSimilar(asset.priceUsd, seenAsset.priceUsd)
            ) {
                duplicatedSymbol = seenAsset.symbol;
            }
        });

        if (duplicatedSymbol) {
            duplicates[duplicatedSymbol] = [...(duplicates[duplicatedSymbol] ?? []), asset.symbol];
            return false;
        }

        seenAssets.push(asset);
        return true;
    });

    return {
        assets,
        duplicates,
    };
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

// alternative. Currently we use populateMissingAssetHistory
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

export const normalizeAssetHistoryToStartOfTheDay = (
    history: RawAssetHistory[] | undefined = []
): RawAssetHistory[] => {
    return history.map(item => {
        const normalizedItem = momentTimeZone.tz(item.time, "UTC").startOf("day");

        return {
            ...item,
            time: normalizedItem.valueOf(),
            date: normalizedItem.toISOString(),
        };
    });
};
