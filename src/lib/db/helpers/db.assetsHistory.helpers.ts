import {AssetHistory} from "@/utils/types/general.types"; // Assuming this is the correct path
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";
import {getDaysArray} from "@/app/[locale]/indices/helpers";
import moment from "moment";

// Define the table name for `AssetHistory`
const TABLE_NAME_ASSET_HISTORY = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSET_HISTORY; // Ensure this table exists in your database

// Helper function: Insert `AssetHistory` into the database
export const dbPostAssetHistory = async (data: AssetHistory[]) => {
    try {
        // Prepare the SQL query with multiple VALUES clauses
        const sql = `
            INSERT INTO ${TABLE_NAME_ASSET_HISTORY} (assetId, priceUsd, time, date, clonedFrom)
            VALUES ${data.map(() => "(?, ?, ?, ?, ?)").join(", ")}
            ON DUPLICATE KEY UPDATE
              priceUsd = VALUES(priceUsd), 
              time = VALUES(time), 
              date = VALUES(date),
              clonedFrom = VALUES(clonedFrom);
        `;

        // Flatten the data array into a single set of values
        const values = data.flatMap(item => [
            item.assetId,
            item.priceUsd,
            item.time,
            item.date,
            item.clonedFrom || null,
        ]);

        // Execute the query once with the entire batch of data
        await mySqlPool.execute(sql, values);

        // Invalidate cache after successful insertion/update
        revalidateTag(combineCacheTags(CacheTag.ASSETS_HISTORY, data[0].assetId), "max");
        console.log("Asset histories inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting asset histories:", error);
        throw error;
    }
};

// Helper function: Fetch all history for a specific asset by `assetId`
export const dbGetAssetHistoryById = async (assetId: string): Promise<AssetHistory[]> => {
    "use cache";
    cacheTag(CacheTag.ASSETS_HISTORY, combineCacheTags(CacheTag.ASSETS_HISTORY, assetId));

    try {
        const sql = `
            SELECT * FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ?
            ORDER BY time ASC 
            ;
        `;
        const [rows] = await mySqlPool.query(sql, [assetId]);
        return rows as AssetHistory[];
    } catch (error) {
        console.error("Error fetching asset histories by ID:", error);
        throw error;
    }
};

// Helper function: Get missed asset history by assetId and time range (history per day)
export const dbGetMissedAssetHistoryById = async (params: {
    assetId: string;
    startTime?: number;
    endTime?: number;
}): Promise<number[]> => {
    const {assetId, startTime, endTime} = params;

    try {
        // First, get the earliest and latest records for this asset to determine the actual range
        const rangeQuery = `
            SELECT MIN(time) as minTime, MAX(time) as maxTime 
            FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ?;
        `;
        const [rangeRows] = await mySqlPool.query(rangeQuery, [assetId]);
        const rangeResult = rangeRows as {minTime: number | null; maxTime: number | null}[];

        if (!rangeResult[0] || rangeResult[0].minTime === null || rangeResult[0].maxTime === null) {
            // No records exist for this asset at all
            if (!startTime || !endTime) {
                return []; // Can't determine range without parameters
            }
            return getDaysArray(startTime, endTime);
        }

        const dbMinTime = rangeResult[0].minTime;
        const dbMaxTime = rangeResult[0].maxTime;

        // Determine the actual range to check
        const actualStartTime = startTime ? Math.max(startTime, dbMinTime) : dbMinTime;
        const actualEndTime = endTime ? Math.min(endTime, dbMaxTime) : dbMaxTime;

        // If the requested range is outside the database range, return the missing days
        if (startTime && endTime) {
            const missedDays: number[] = [];

            // Check if there are days before the first record
            if (startTime < dbMinTime) {
                missedDays.push(...getDaysArray(startTime, dbMinTime));
            }

            // Check if there are days after the last record
            if (endTime > dbMaxTime) {
                missedDays.push(...getDaysArray(dbMaxTime + 86400000, endTime)); // +1 day to avoid overlap
            }

            // Now check for gaps within the existing range
            if (actualStartTime <= actualEndTime) {
                const sql = `
                    SELECT time FROM ${TABLE_NAME_ASSET_HISTORY} 
                    WHERE assetId = ? AND time >= ? AND time <= ?
                    ORDER BY time ASC;
                `;
                const [rows] = await mySqlPool.query(sql, [assetId, actualStartTime, actualEndTime]);
                const existingHistories = rows as {time: number}[];

                // Get array of all expected days in the actual range
                const expectedDays = getDaysArray(actualStartTime, actualEndTime);

                // Get existing times as a Set for efficient lookup
                const existingTimes = new Set(existingHistories.map(h => h.time));

                // Find missed days by filtering out existing ones
                const gapsInRange = expectedDays.filter(day => !existingTimes.has(day));

                missedDays.push(...gapsInRange);
            }

            return missedDays.sort((a, b) => a - b); // Sort chronologically
        } else {
            // If no specific range provided, check for gaps within the entire database range
            const sql = `
                SELECT time FROM ${TABLE_NAME_ASSET_HISTORY} 
                WHERE assetId = ? AND time >= ? AND time <= ?
                ORDER BY time ASC;
            `;
            const [rows] = await mySqlPool.query(sql, [assetId, dbMinTime, dbMaxTime]);
            const existingHistories = rows as {time: number}[];

            // Get array of all expected days in the database range
            const expectedDays = getDaysArray(dbMinTime, dbMaxTime);

            // Get existing times as a Set for efficient lookup
            const existingTimes = new Set(existingHistories.map(h => h.time));

            // Find missed days by filtering out existing ones
            const missedDays = expectedDays.filter(day => !existingTimes.has(day));

            return missedDays;
        }
    } catch (error) {
        console.error("Error fetching missed asset histories by ID:", error);
        throw error;
    }
};

// Helper function: Group missed days into continuous date ranges
export const groupMissedDaysIntoRanges = (
    missedDays: number[]
): Array<{start: number; end: number; daysCount: number}> => {
    if (missedDays.length === 0) {
        return [];
    }

    // Sort the missed days to ensure they are in chronological order
    const sortedDays = [...missedDays].sort((a, b) => a - b);

    const ranges: Array<{start: number; end: number; daysCount: number}> = [];
    let rangeStart = sortedDays[0];
    let rangeEnd = sortedDays[0];

    for (let i = 1; i < sortedDays.length; i++) {
        const currentDay = sortedDays[i];
        const previousDay = sortedDays[i - 1];

        // Check if current day is consecutive to the previous day (86400000 ms = 1 day)
        const isConsecutive = currentDay - previousDay === 86400000;

        if (isConsecutive) {
            // Extend the current range
            rangeEnd = currentDay;
        } else {
            // End the current range and start a new one
            const daysInRange = getDaysArray(rangeStart, rangeEnd + 86400000).length; // +1 day to include end day
            ranges.push({
                start: rangeStart,
                end: rangeEnd,
                daysCount: daysInRange,
            });

            // Start new range
            rangeStart = currentDay;
            rangeEnd = currentDay;
        }
    }

    // Don't forget to add the last range
    const daysInRange = getDaysArray(rangeStart, rangeEnd + 86400000).length; // +1 day to include end day
    ranges.push({
        start: rangeStart,
        end: rangeEnd,
        daysCount: daysInRange,
    });

    return ranges;
};

// Helper function: Get missed asset history grouped by ranges
export const dbGetMissedAssetHistoryRangesById = async (params: {
    assetId: string;
    startTime?: number;
    endTime?: number;
}): Promise<{
    assetId: string;
    ranges: Array<{start: number; end: number; daysCount: number; startDate: string; endDate: string}>;
}> => {
    try {
        const missedDays = await dbGetMissedAssetHistoryById(params);
        const ranges = groupMissedDaysIntoRanges(missedDays);

        // Add formatted date strings for easier reading
        return {
            assetId: params.assetId,
            ranges: ranges.map(range => ({
                ...range,
                startDate: moment(range.start).utc().format("YYYY-MM-DD"),
                endDate: moment(range.end).utc().format("YYYY-MM-DD"),
            })),
        };
    } catch (error) {
        console.error("Error fetching missed asset history ranges by ID:", error);
        throw error;
    }
};

// Helper function: Remove all asset histories by assetId
export const dbDeleteAssetHistoryById = async (assetId: string): Promise<void> => {
    try {
        const sql = `
            DELETE FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ?;
        `;

        await mySqlPool.execute(sql, [assetId]);

        // Invalidate cache after successful deletion
        revalidateTag(combineCacheTags(CacheTag.ASSETS_HISTORY, assetId), "max");
        console.log(`Asset histories for assetId ${assetId} deleted successfully!`);
    } catch (error) {
        console.error(`Error deleting asset histories for assetId ${assetId}:`, error);
        throw error;
    }
};

// Helper function: Fetch all history for a specific asset by `assetId` with optional `startTime`
export const dbGetAssetHistoryByIdAndStartTime = async (
    assetId: string,
    startTime: number
): Promise<AssetHistory[]> => {
    "use cache";
    cacheTag(CacheTag.ASSETS_HISTORY, combineCacheTags(CacheTag.ASSETS_HISTORY, assetId, startTime));

    try {
        const sql = `
            SELECT * FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ? AND time >= ?
            ORDER BY time ASC;
        `;
        const [rows] = await mySqlPool.query(sql, [assetId, startTime]);
        return rows as AssetHistory[];
    } catch (error) {
        console.error("Error fetching asset histories by ID and start time:", error);
        throw error;
    }
};

// Helper function: Fetch history for multiple assets by array of assetIds with startTime
export const dbGetMultipleAssetHistoryByStartTime = async (
    assetIds: string[],
    startTime: number
): Promise<Record<string, AssetHistory[]>> => {
    "use cache";
    // Create a combined cache tag for all asset IDs
    const cacheTagKey = combineCacheTags(CacheTag.ASSETS_HISTORY, CacheTag.ASSETS_HISTORY_OVERVIEW, startTime);
    cacheTag(CacheTag.ASSETS_HISTORY, cacheTagKey);

    try {
        // Early return if no asset IDs provided
        if (!assetIds || assetIds.length === 0) {
            return {};
        }

        // Create placeholders for SQL IN clause
        const placeholders = assetIds.map(() => "?").join(", ");

        const sql = `
            SELECT * FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId IN (${placeholders}) AND time >= ?
            ORDER BY assetId ASC, time ASC;
        `;

        // Combine assetIds and startTime for query parameters
        const queryParams = [...assetIds, startTime];

        const [rows] = await mySqlPool.query(sql, queryParams);
        const histories = rows as AssetHistory[];

        // Group histories by assetId
        const result: Record<string, AssetHistory[]> = {};

        // Initialize all assetIds with empty arrays to ensure all requested IDs are in result
        assetIds.forEach(assetId => {
            result[assetId] = [];
        });

        // Populate the result with actual data
        histories.forEach(history => {
            result[history.assetId].push(history);
        });

        return result;
    } catch (error) {
        console.error("Error fetching multiple asset histories by start time:", error);
        throw error;
    }
};
