import {AssetHistory} from "@/utils/types/general.types"; // Assuming this is the correct path
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";

// Define the table name for `AssetHistory`
const TABLE_NAME_ASSET_HISTORY = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSET_HISTORY; // Ensure this table exists in your database

// Helper function: Insert `AssetHistory` into the database
export const dbPostAssetHistory = async (data: AssetHistory[]) => {
    try {
        // Prepare the SQL query with multiple VALUES clauses
        const sql = `
            INSERT INTO ${TABLE_NAME_ASSET_HISTORY} (assetId, priceUsd, time, date)
            VALUES ${data.map(() => "(?, ?, ?, ?)").join(", ")}
            ON DUPLICATE KEY UPDATE
              priceUsd = VALUES(priceUsd), 
              time = VALUES(time), 
              date = VALUES(date);
        `;

        // Flatten the data array into a single set of values
        const values = data.flatMap(item => [item.assetId, item.priceUsd, item.time, item.date]);

        // Execute the query once with the entire batch of data
        await mySqlPool.execute(sql, values);

        // Invalidate cache after successful insertion/update
        revalidateTag(combineTags(CacheTag.ASSET_HISTORY, data[0].assetId));
        console.log("Asset histories inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting asset histories:", error);
        throw error;
    }
};

// Helper function: Fetch all history for a specific asset by `assetId`
export const dbGetAssetHistoryById = async (assetId: string): Promise<AssetHistory[]> => {
    "use cache";
    cacheTag(combineTags(CacheTag.ASSET_HISTORY, assetId));

    try {
        const sql = `
            SELECT * FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ? 
            ;
        `;
        const [rows] = await mySqlPool.query(sql, [assetId]);
        return rows as AssetHistory[];
    } catch (error) {
        console.error("Error fetching asset histories by ID:", error);
        throw error;
    }
};

// Helper function: Fetch all history for a specific asset by `assetId` with optional `startTime`
export const dbGetAssetHistoryByIdAndStartTime = async (
    assetId: string,
    startTime: number
): Promise<AssetHistory[]> => {
    try {
        const sql = `
            SELECT * FROM ${TABLE_NAME_ASSET_HISTORY} 
            WHERE assetId = ? AND time >= ?
            ;
        `;
        const [rows] = await mySqlPool.query(sql, [assetId, startTime]);
        return rows as AssetHistory[];
    } catch (error) {
        console.error("Error fetching asset histories by ID and start time:", error);
        throw error;
    }
};
