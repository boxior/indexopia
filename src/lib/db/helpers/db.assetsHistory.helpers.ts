import {AssetHistory} from "@/utils/types/general.types"; // Assuming this is the correct path
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";

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
        revalidateTag(combineCacheTags(CacheTag.ASSETS_HISTORY, data[0].assetId));
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

// Helper function: Remove all asset histories by assetId
export const dbDeleteAssetHistoryById = async (assetId: string): Promise<void> => {
    try {
        const sql = `
            DELETE FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ?;
        `;

        await mySqlPool.execute(sql, [assetId]);

        // Invalidate cache after successful deletion
        revalidateTag(combineCacheTags(CacheTag.ASSETS_HISTORY, assetId));
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
