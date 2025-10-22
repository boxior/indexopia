import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {AssetHistory, RawAssetHistory} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {omit} from "lodash";
import {setQueryParams} from "@/utils/heleprs/setQueryParams.helper";
import {populateMissingAssetHistory} from "@/app/[locale]/indices/helpers";
import {YEAR_IN_MS} from "@/utils/constants/general.constants";
import {normalizeAssetHistoryToStartOfTheDay} from "@/lib/db/helpers/db.helpers";
import {secondsUntilNextMidnightUTC} from "@/utils/heleprs/fetch/fetch.helpers";
import moment from "moment";

/**
 * {error: string}
 */
export enum CoinCapHistoryErrorsEnum {
    FORBIDDEN = "forbidden",
    NOT_FOUND = "notFound",
    ASSET_NOT_FOUND = "assetNotFound",
    UNKNOWN = "unknown",
}

export type CoinCapHistoryResponse = {
    error?: string;
    data?: AssetHistory[];
    timestamp?: number; // date of receiving error
};

export type CoinCapHistoryErrors = Record<CoinCapHistoryErrorsEnum, CoinCapHistoryResponse>;

export const COIN_CAP_HISTORY_ERRORS: CoinCapHistoryErrors = {
    forbidden: {
        error: "Forbidden: Monthly usage limit exceeded",
    },
    notFound: {
        error: "Asset history not found",
        timestamp: 1760857323854,
    },
    assetNotFound: {
        error: "Asset not found",
        timestamp: 1760857323854,
    },
    unknown: {},
};

/**
 * When populate history:
 * 1. error: Asset history not found
 * 2. data exists, but there are missed values: in the middle, firstly, at the end
 * 3.
 */

export type FetchAssetHistoryParams = {
    interval: string; // point-in-time interval, e.g. m1, m5, m15, m30, h1, h2, h6, h12, d1
    id: string; // asset id, e.g. asset id
    start?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    end?: number; // UNIX time in milliseconds up to 11 years for d1, e.g. 1528470720000
    lastHistoryBefore?: AssetHistory;
};

/**
 * Splits a time range into chunks of n days, starting at UTC midnight
 * Requires moment.js library
 * @param {number} start - Start timestamp in milliseconds
 * @param {number} end - End timestamp in milliseconds
 * @param {number} numberOfDays - Number of days per range
 * @returns {Array<{start: number, end: number}>} Array of time ranges
 */
export function splitTimeRangeByYear(start: number, end: number, numberOfDays: number | undefined = 365) {
    // Normalize start to beginning of UTC day
    const startOfDay = moment.utc(start).startOf("day");

    // Normalize end to beginning of UTC day
    const endOfDay = moment.utc(end).startOf("day");

    const ranges = [];
    let currentStart = startOfDay.clone();

    while (currentStart.isBefore(endOfDay) || currentStart.isSame(endOfDay)) {
        // Calculate end of current chunk (start + numberOfDays)
        const currentEnd = currentStart.clone().add(numberOfDays, "days");

        // Use the earlier of: chunk end or normalized end date
        const rangeEnd = moment.min(currentEnd, endOfDay.clone().add(1, "day"));

        ranges.push({
            start: currentStart.valueOf(),
            end: moment.min(endOfDay, rangeEnd).valueOf(),
        });

        // Move to next chunk (start of day after current chunk)
        currentStart = currentEnd.clone();
    }

    return ranges;
}

// Helper function to split time range into 1-year chunks
// export function splitTimeRangeByYear(
//     start: number,
//     end: number,
//     upToRange: number | undefined = YEAR_IN_MS
// ): Array<{start: number; end: number}> {
//     const ranges: Array<{start: number; end: number}> = [];
//
//     const propStart = moment(start).utc().startOf("day").valueOf();
//     const propEnd = moment(end).utc().startOf("day").valueOf();
//
//     let currentStart = propStart;
//
//     while (currentStart < propEnd) {
//         const currentEnd = Math.min(currentStart + upToRange, propEnd);
//         ranges.push({
//             start: currentStart,
//             end: currentEnd,
//         });
//         currentStart = currentEnd;
//     }
//
//     return ranges;
// }

export type RawHistoryResponse = {
    data: RawAssetHistory[];
    shouldPopulate: boolean;
};
const handleCoinCapHistoryResponse = (res: CoinCapHistoryResponse): RawHistoryResponse => {
    switch (true) {
        case !!res.data:
            return {
                data: normalizeAssetHistoryToStartOfTheDay(res.data),
                shouldPopulate: true,
            };
        case res.error === COIN_CAP_HISTORY_ERRORS.notFound.error:
            return {
                data: [],
                shouldPopulate: true,
            };

        default:
            return {
                data: [],
                shouldPopulate: false,
            };
    }
};

// Single fetch helper
async function fetchSingleRange(
    params: FetchAssetHistoryParams,
    start: number,
    end: number
): Promise<RawHistoryResponse> {
    try {
        const fetchParams = {
            ...omit(params, ["id", "lastHistoryBefore"]),
            start, // raw data include start date.
            end, // raw data does not include end date.
        };

        const strUrl = setQueryParams(
            `${ENV_VARIABLES.COINCAP_PRO_API_URL}/assets/${params.id}/history?apiKey=${ENV_VARIABLES.COINCAP_PRO_API_KEY}`,
            fetchParams
        );

        const history: CoinCapHistoryResponse = await fetch(strUrl, {
            next: {revalidate: secondsUntilNextMidnightUTC()},
        }).then(res => res.json());

        return handleCoinCapHistoryResponse(history);
    } catch (error) {
        console.log(error);
        return {
            data: [],
            shouldPopulate: false,
        };
    }
}

const handleFetchSingleRange = async (params: FetchAssetHistoryParams): Promise<RawHistoryResponse> => {
    const historyResponse = await fetchSingleRange(params, params.start ?? 0, params.end ?? 0);
    await writeJsonFile(
        `history_${params.id}:${moment(params.start).toISOString()}-${moment(params.end).toISOString()}`,
        historyResponse.data,
        "/db/raw-history"
    );

    return historyResponse;
};

// We have a limitation from 3rd party API that we can only fetch up to 1 years of data at a time.
export default async function fetchAssetHistory(
    params: FetchAssetHistoryParams,
    upToRange: number | undefined = YEAR_IN_MS
): Promise<{data: RawAssetHistory[]}> {
    try {
        // If no start/end provided, use original single request
        const {start: paramsStart = 0, end: paramsEnd = 0} = params;

        const timeDiff = paramsEnd - paramsStart;

        // If time range is less than or equal to 1 year, make single request
        if (timeDiff <= upToRange) {
            const historyResponse = await handleFetchSingleRange(params);

            const populatedHistory = historyResponse.shouldPopulate
                ? populateMissingAssetHistory<RawAssetHistory>({
                      lastHistoryBefore: params.lastHistoryBefore,
                      histories: historyResponse.data,
                      startTime: params.start ?? 0,
                      endTime: params.end ?? 0,
                      assetId: params.id,
                  })
                : historyResponse.data;

            await writeJsonFile(
                `history_${params.id}:${moment(params.start).toISOString()}-${moment(params.end).toISOString()}`,
                populatedHistory,
                "/db/populated-history"
            );

            // Sort by timestamp to ensure proper order
            populatedHistory.sort((a, b) => a.time - b.time);

            return {data: populatedHistory};
        }

        // Split time range into 1-year chunks
        const timeRanges = splitTimeRangeByYear(paramsStart, paramsEnd);

        // Fetch all ranges in parallel
        const fetchPromises: Promise<RawHistoryResponse>[] = timeRanges.map((range, rangeI) => {
            return handleFetchSingleRange({
                ...params,
                start: range.start,
                end: range.end,
            });
        });

        const allRawHistoryResponses = await Promise.all(fetchPromises);

        const allPopulatedHistory: RawAssetHistory[][] = [];

        for (const [index, rawHistoryResponse] of allRawHistoryResponses.entries()) {
            if (rawHistoryResponse.shouldPopulate) {
                allPopulatedHistory.push(
                    populateMissingAssetHistory<RawAssetHistory>({
                        lastHistoryBefore:
                            index === 0
                                ? params.lastHistoryBefore
                                : allPopulatedHistory[index - 1]?.[allPopulatedHistory[index - 1].length - 1],
                        histories: rawHistoryResponse.data,
                        startTime: timeRanges[index]?.start ?? 0,
                        endTime: timeRanges[index]?.end ?? 0,
                        assetId: params.id,
                    })
                );
            }
        }

        // Merge all results into single array
        const populatedHistory = allPopulatedHistory.flat();

        // Sort by timestamp to ensure proper order
        populatedHistory.sort((a, b) => a.time - b.time);

        return {data: populatedHistory};
    } catch (error) {
        console.log(error);
        throw error;
    }
}
