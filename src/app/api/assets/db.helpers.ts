import {readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import getAssets from "@/app/api/assets/getAssets";
import getAssetHistory from "@/app/api/assets/getAssetHistory";
import {DbItems} from "@/app/api/assets/db.types";
import {Asset, AssetHistory, Index, NormalizedAssetHistory, NormalizedAssets} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
export const ASSETS_FOLDER_PATH = "/db/assets";
export const ASSETS_HISTORY_FOLDER_PATH = "/db/assets_history";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleGetAllAssets = async () => {
    const fileName = "assets";

    const prevData = await readJsonFile(fileName, {}, ASSETS_FOLDER_PATH);
    const prevList = (prevData as any)?.data ?? [];

    const nextData = await getAssets({limit: 2000, offset: prevList.length});
    const nextList = (nextData as any).data ?? [];

    if (nextList.length === 0) {
        return;
    }

    await writeJsonFile(fileName, {data: [...prevList, ...nextList]}, ASSETS_FOLDER_PATH);

    return await handleGetAllAssets();
};

export const handleGetAssetHistory = async ({id}: {id: string}): Promise<AssetHistory[]> => {
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

    const newData = await getAssetHistory({
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
export const handleGetAllAssetsHistories = async (upToRank: number | undefined = 50) => {
    const assets = await readJsonFile("assets", {}, ASSETS_FOLDER_PATH);
    const assetsList = ((assets as any)?.data ?? []).slice(0, upToRank);

    for (const asset of assetsList) {
        try {
            await handleGetAssetHistory({id: asset.id});
        } catch (err) {
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

export const getTopAssets = async (limit: number): Promise<Asset[]> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = assets?.data ?? [];

    return assetsList.slice(0, limit);
};

export const getIndexHistoryOverview = async (
    index: Omit<Index, "historyOverview" | "startTime">
): Promise<{historyOverview: HistoryOverview; startTime: number | null}> => {
    // Read all assets
    const indexAssets = index.assets;

    // Initialize cumulative performance variables
    let days1 = 0;
    let days7 = 0;
    let total = 0;

    // Track valid asset count for averaging
    let validAssetCount = 0;

    const {histories, startTime} = await fetchAssetHistoriesWithSmallestRange(indexAssets.map(asset => asset.id));

    for (const asset of indexAssets) {
        try {
            const assetHistoryOverview = await getAssetHistoryOverview(asset.id, histories[asset.id]);

            // Accumulate changes
            days1 += assetHistoryOverview.days1;
            days7 += assetHistoryOverview.days7;
            total += assetHistoryOverview.total;

            validAssetCount += 1;
        } catch (error) {
            console.error(`Failed to calculate history overview for asset ${asset.id}`, error);
            continue; // Skip assets with errors
        }
    }

    // If no valid assets exist in the index, return zeros
    if (validAssetCount === 0) {
        return {
            historyOverview: {days1: 0, days7: 0, total: 0},
            startTime: null,
        };
    }

    const historyOverview = {
        days1: days1 / validAssetCount,
        days7: days7 / validAssetCount,
        total: total / validAssetCount,
    };

    console.log("historyOverview", historyOverview);
    // Calculate averages
    return {
        historyOverview,
        startTime,
    };
};

export const fetchAssetHistoriesWithSmallestRange = async (
    assetIds: string[]
): Promise<{histories: Record<string, AssetHistory[]>; startTime: number | null}> => {
    const histories: Record<string, AssetHistory[]> = {};
    let minStartTime: number | null = null;

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

            // Determine this asset's start time and update the global minimum
            const assetStartTime = Math.min(...historyList.map(item => item.time));
            // const assetStartTime = historyList[0].time;
            minStartTime = minStartTime === null ? assetStartTime : Math.max(minStartTime, assetStartTime); // Take the latest overlapping start time

            histories[assetId] = historyList;
        } catch (error) {
            console.error(`Error reading history for asset ID ${assetId}:`, error);
            histories[assetId] = []; // Handle error gracefully
        }
    }

    // Step 2: Filter each asset's history to align with the minimum start time found
    if (minStartTime !== null) {
        const filteredStartTime = momentTimeZone.tz(minStartTime, "UTC").startOf("day").valueOf();
        for (const assetId of assetIds) {
            histories[assetId] = histories[assetId].filter(item => item.time >= filteredStartTime);
        }
    }

    return {histories, startTime: minStartTime};
};

export const getIndexHistory = async (index: Omit<Index, "historyOverview" | "startTime">): Promise<AssetHistory[]> => {
    const {histories, startTime} = await fetchAssetHistoriesWithSmallestRange(index.assets.map(asset => asset.id));
    await writeJsonFile("hisotires_record", histories, "/db/history_records");
    return mergeAssetHistories(Object.values(histories));
};

function mergeAssetHistories(histories: AssetHistory[][]): AssetHistory[] {
    if (histories.length === 0 || histories[0].length === 0) {
        return [];
    }

    const arrayLength = histories[0].length;

    const merged: AssetHistory[] = [];

    if (!histories.every(history => history.length === arrayLength)) {
        throw new Error("All histories must have the same length");
    }

    for (let i = 0; i < arrayLength; i++) {
        const currentElements = histories.map(historyArray => historyArray[i]);

        // Since we assume time and date are the same across arrays, pick them from the first array
        const {time, date} = currentElements[0];

        const averagePrice = (
            currentElements.reduce((sum, asset) => sum + parseFloat(asset.priceUsd), 0) / currentElements.length
        ).toFixed(20); // Ensure a fixed precision for the result

        merged.push({
            time,
            date,
            priceUsd: averagePrice,
        });
    }

    return merged;
}
