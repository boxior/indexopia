import {Asset} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";

const TABLE_NAME_ASSETS = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSETS; // Ensure this table exists in your database

// Helper function: Insert data into the database
export const dbPostAssets = async (data: Asset[]) => {
    try {
        // Prepare the SQL query with multiple VALUES clauses
        const sql = `
            INSERT INTO ${TABLE_NAME_ASSETS} (id, rank, symbol, name, supply, maxSupply, 
                                              marketCapUsd, volumeUsd24Hr, priceUsd, 
                                              changePercent24Hr, vwap24Hr, explorer)
            VALUES ${data.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
            ON DUPLICATE KEY UPDATE
                rank = VALUES(rank), symbol = VALUES(symbol), name = VALUES(name),
                supply = VALUES(supply), maxSupply = VALUES(maxSupply), 
                marketCapUsd = VALUES(marketCapUsd), volumeUsd24Hr = VALUES(volumeUsd24Hr),
                priceUsd = VALUES(priceUsd), changePercent24Hr = VALUES(changePercent24Hr),
                vwap24Hr = VALUES(vwap24Hr), explorer = VALUES(explorer);
        `;

        // Flatten the data array into a single set of values
        const values = data.flatMap(item => [
            item.id,
            item.rank,
            item.symbol,
            item.name,
            item.supply,
            item.maxSupply,
            item.marketCapUsd,
            item.volumeUsd24Hr,
            item.priceUsd,
            item.changePercent24Hr,
            item.vwap24Hr,
            item.explorer,
        ]);

        // Execute the query once with the entire batch of data
        await mySqlPool.execute(sql, values);

        // Invalidate the cache after inserting/updating the data
        revalidateTag(CacheTag.ASSETS);
        console.log("Data inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
};

// Helper function: Fetch all data from the database
export const dbGetAssets = async (): Promise<Asset[]> => {
    "use cache";
    cacheTag(CacheTag.ASSETS);

    try {
        const [rows] = await mySqlPool.query(`SELECT * FROM ${TABLE_NAME_ASSETS}`);
        return rows as Asset[];
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};
// Helper function: Fetch data by ID
export const dbGetAssetById = async (id: string) => {
    "use cache";
    cacheTag(CacheTag.ASSETS, combineCacheTags(CacheTag.ASSETS, id));

    try {
        const [rows] = (await mySqlPool.query(`SELECT * FROM ${TABLE_NAME_ASSETS} WHERE id = ?`, [id])) as unknown as [
            Asset[],
        ];
        return rows[0] || null;
    } catch (error) {
        console.error("Error fetching data by ID:", error);
        throw error;
    }
};
// Helper function: Fetch data by multiple IDs
export const dbGetAssetsByIds = async (ids: string[]) => {
    "use cache";
    cacheTag(CacheTag.ASSETS, combineCacheTags(CacheTag.ASSETS, ...ids));

    try {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => "?").join(", "); // Generate placeholders (?, ?, ?)
        const sql = `SELECT * FROM ${TABLE_NAME_ASSETS} WHERE id IN (${placeholders})`;
        const [rows] = (await mySqlPool.query(sql, ids)) as unknown as [Asset[]];
        return rows;
    } catch (error) {
        console.error("Error fetching data by IDs:", error);
        throw error;
    }
};
// Helper function: Fetch data up to a specific rank
export const dbGetAssetsByRank = async (upToRank: number) => {
    "use cache";
    cacheTag(CacheTag.ASSETS, combineCacheTags(CacheTag.ASSETS, upToRank));

    try {
        const sql = `SELECT * FROM ${TABLE_NAME_ASSETS} WHERE CAST(rank AS UNSIGNED)
 <= ?`;
        const [rows] = (await mySqlPool.query(sql, [upToRank])) as unknown as [Asset[]];
        return rows;
    } catch (error) {
        console.error("Error fetching data by rank:", error);
        throw error;
    }
};
