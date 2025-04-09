import mysql from "mysql2/promise";
import {ENV_VARIABLES} from "@/env";
import {Asset} from "@/utils/types/general.types";

// Set up the MySQL connection
const pool = mysql.createPool({
    host: ENV_VARIABLES.MYSQL_HOST, // Replace with your MySQL host
    user: ENV_VARIABLES.MYSQL_USER, // Replace with your MySQL username
    password: ENV_VARIABLES.MYSQL_PASSWORD, // Replace with your MySQL password
    database: ENV_VARIABLES.MYSQL_DATABASE, // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Define the table name
const TABLE_NAME_ASSETS = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSETS; // Ensure this table exists in your database

// Helper function: Insert data into the database
export const insertAssets = async (data: Asset[]) => {
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
            pool.execute(sql, [
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
        console.log("Data inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
};

// Helper function: Fetch all data from the database
export const queryAssets = async () => {
    try {
        const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME_ASSETS}`);
        return rows;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

// Helper function: Fetch data by ID
export const queryAssetById = async (id: string) => {
    try {
        const [rows] = (await pool.query(`SELECT * FROM ${TABLE_NAME_ASSETS} WHERE id = ?`, [id])) as unknown as [
            Asset[],
        ];
        return rows[0] || null;
    } catch (error) {
        console.error("Error fetching data by ID:", error);
        throw error;
    }
};

// Helper function: Fetch data by multiple IDs
export const queryAssetsByIds = async (ids: string[]) => {
    try {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => "?").join(", "); // Generate placeholders (?, ?, ?)
        const sql = `SELECT * FROM ${TABLE_NAME_ASSETS} WHERE id IN (${placeholders})`;
        const [rows] = (await pool.query(sql, ids)) as unknown as [Asset[]];
        return rows;
    } catch (error) {
        console.error("Error fetching data by IDs:", error);
        throw error;
    }
};

// Helper function: Fetch data up to a specific rank
export const queryAssetsByRank = async (upToRank: number) => {
    try {
        const sql = `SELECT * FROM ${TABLE_NAME_ASSETS} WHERE rank <= ? ORDER BY rank ASC`;
        const [rows] = (await pool.query(sql, [upToRank])) as unknown as [Asset[]];
        return rows;
    } catch (error) {
        console.error("Error fetching data by rank:", error);
        throw error;
    }
};
