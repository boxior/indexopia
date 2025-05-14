// Define the table name
import {Asset} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";

const TABLE_NAME_ASSETS = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSETS; // Ensure this table exists in your database
// Helper function: Insert data into the database
export const dbInsertAssets = async (data: Asset[]) => {
    try {
        const sql = `
      INSERT INTO ${TABLE_NAME_ASSETS} (id, rank, symbol, name, supply, maxSupply, 
                                 marketCapUsd, volumeUsd24Hr, priceUsd, 
                                 changePercent24Hr, vwap24Hr, explorer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rank = VALUES(rank), symbol = VALUES(symbol), name = VALUES(name),
        supply = VALUES(supply), maxSupply = VALUES(maxSupply), 
        marketCapUsd = VALUES(marketCapUsd), volumeUsd24Hr = VALUES(volumeUsd24Hr),
        priceUsd = VALUES(priceUsd), changePercent24Hr = VALUES(changePercent24Hr),
        vwap24Hr = VALUES(vwap24Hr), explorer = VALUES(explorer);
    `;

        const promises = data.map(item =>
            mySqlPool.execute(sql, [
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
            ])
        );

        await Promise.all(promises);
        revalidateTag(CacheTag.ASSETS);
        console.log("Data inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
};

// Helper function: Fetch all data from the database
export const dbQueryAssets = async (): Promise<Asset[]> => {
    "use cache";
    cacheTag(CacheTag.ASSETS);

    try {
        const uuid = generateUuid();
        // console.time("dbQueryAssets_" + uuid);
        const [rows] = await mySqlPool.query(`SELECT * FROM ${TABLE_NAME_ASSETS}`);
        // console.timeEnd("dbQueryAssets_" + uuid);
        return rows as Asset[];
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};
// Helper function: Fetch data by ID
export const dbQueryAssetById = async (id: string) => {
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
export const dbQueryAssetsByIds = async (ids: string[]) => {
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
export const dbQueryAssetsByRank = async (upToRank: number) => {
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
