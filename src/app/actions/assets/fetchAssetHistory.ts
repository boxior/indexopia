import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {AssetHistory} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {omit} from "lodash";
import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {populateMissingAssetHistory} from "@/app/[locale]/indices/helpers";
import {YEAR_IN_MS} from "@/utils/constants/general.constants";
import {normalizeAssetHistoryToStartOfTheDay} from "@/lib/db/helpers/db.helpers";
import {secondsUntilNextMidnightUTC} from "@/utils/heleprs/axios/axios.helpers";

export type FetchAssetHistoryParams = {
    interval: string; // point-in-time interval, e.g. m1, m5, m15, m30, h1, h2, h6, h12, d1
    id: string; // asset id, e.g. asset id
    start?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    end?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    lastHistoryBefore?: AssetHistory;
};

// Helper function to split time range into 1-year chunks
function splitTimeRangeByYear(
    start: number,
    end: number,
    upToRange: number | undefined = YEAR_IN_MS
): Array<{start: number; end: number}> {
    const ranges: Array<{start: number; end: number}> = [];

    let currentStart = start;

    while (currentStart < end) {
        const currentEnd = Math.min(currentStart + upToRange, end);
        ranges.push({
            start: currentStart,
            end: currentEnd,
        });
        currentStart = currentEnd;
    }

    return ranges;
}

// Single fetch helper
async function fetchSingleRange(
    params: FetchAssetHistoryParams,
    start: number,
    end: number
): Promise<Omit<AssetHistory, "assetId">[]> {
    const fetchParams = {
        ...omit(params, ["id", "lastHistoryBefore"]),
        start,
        end,
    };

    const strUrl = setQueryParams(
        `${ENV_VARIABLES.COINCAP_PRO_API_URL}/assets/${params.id}/history?apiKey=${ENV_VARIABLES.COINCAP_PRO_API_KEY}`,
        fetchParams
    );

    const history = await fetch(strUrl, {
        next: {revalidate: secondsUntilNextMidnightUTC()},
    }).then(res => res.json());

    return normalizeAssetHistoryToStartOfTheDay(history.data ?? []);
}

// We have a limitation from 3rd party API that we can only fetch up to 1 years of data at a time.
export default async function fetchAssetHistory(
    params: FetchAssetHistoryParams,
    upToRange: number | undefined = YEAR_IN_MS
): Promise<{data: Omit<AssetHistory, "assetId">[]}> {
    try {
        // If no start/end provided, use original single request
        if (!params.start || !params.end) {
            const strUrl = setQueryParams(
                `${ENV_VARIABLES.COINCAP_PRO_API_URL}/assets/${params.id}/history?apiKey=${ENV_VARIABLES.COINCAP_PRO_API_KEY}`,
                omit(params, ["id", "lastHistoryBefore"])
            );

            const history = await fetch(strUrl, {
                next: {revalidate: secondsUntilNextMidnightUTC()},
            }).then(res => res.json());

            const historyData = normalizeAssetHistoryToStartOfTheDay(history.data ?? []);

            await writeJsonFile("history_" + params.id, historyData, "/db/raw-history");
            const populatedHistory = populateMissingAssetHistory<Omit<AssetHistory, "assetId">>({
                lastHistoryBefore: params.lastHistoryBefore,
                histories: historyData,
                startTime: params.start ?? 0,
                endTime: params.end ?? 0,
            });
            await writeJsonFile("history_" + params.id, populatedHistory, "/db/populated-history");

            return {data: populatedHistory};
        }

        const timeDiff = params.end - params.start;

        // If time range is less than or equal to 1 year, make single request
        if (timeDiff <= upToRange) {
            const data = await fetchSingleRange(params, params.start, params.end);

            await writeJsonFile("history_" + params.id, data, "/db/raw-history");
            const populatedHistory = populateMissingAssetHistory<Omit<AssetHistory, "assetId">>({
                histories: data,
                lastHistoryBefore: params.lastHistoryBefore,
                endTime: params.end,
                startTime: params.start,
            });
            await writeJsonFile("history_" + params.id, populatedHistory, "/db/populated-history");

            return {data: populatedHistory};
        }

        // Split time range into 1-year chunks
        const timeRanges = splitTimeRangeByYear(params.start, params.end);

        // Fetch all ranges in parallel
        const fetchPromises = timeRanges.map(range => fetchSingleRange(params, range.start, range.end));

        const allResults = await Promise.all(fetchPromises);

        // Merge all results into single array
        const mergedData = allResults.flat();

        // Sort by timestamp to ensure proper order
        mergedData.sort((a, b) => a.time - b.time);

        await writeJsonFile("history_" + params.id, mergedData, "/db/raw-history");
        const populatedHistory = populateMissingAssetHistory<Omit<AssetHistory, "assetId">>({
            histories: mergedData,
            lastHistoryBefore: params.lastHistoryBefore,
            endTime: params.end,
            startTime: params.start,
        });
        await writeJsonFile("history_" + params.id, populatedHistory, "/db/populated-history");

        return {data: populatedHistory};
    } catch (error) {
        console.log(error);
        throw error;
    }
}
