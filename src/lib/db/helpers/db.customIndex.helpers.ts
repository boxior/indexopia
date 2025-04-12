// Import required modules
import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {CustomIndexType} from "@/utils/types/general.types";

// Define the table name for Custom Index
const TABLE_NAME_CUSTOM_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX; // Ensure your database table exists
const TABLE_NAME_CUSTOM_INDEX_ASSETS = ENV_VARIABLES.TABLE_NAME_CUSTOM_INDEX_ASSETS; // Ensure your database table exists

// ====== Insert or Update Custom Index ======
export const insertCustomIndexes = async (data: CustomIndexType[]) => {
    try {
        const sql = `
          INSERT INTO ${TABLE_NAME_CUSTOM_INDEX} 
          (id, name, startTime, isDefault, assets)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            startTime = VALUES(startTime),
            isDefault = VALUES(isDefault),
            assets = VALUES(assets);
        `;
        // Map over the data to insert/update each record
        const promises = data.map(index =>
            mySqlPool.execute(sql, [
                index.id,
                index.name,
                index.startTime,
                index.isDefault,
                JSON.stringify(index.assets), // Store the assets field as JSON
            ])
        );

        await Promise.all(promises); // Execute all insert/update queries concurrently
        console.log("Custom indexes inserted/updated successfully!");
    } catch (error) {
        console.error("Error inserting custom indexes:", error);
        throw error;
    }
};

// ====== Query by ID ======
export const queryCustomIndexById = async (id: string): Promise<CustomIndexType | null> => {
    try {
        const sql = `SELECT * FROM ${TABLE_NAME_CUSTOM_INDEX} WHERE id = ?`;
        const [rows] = await mySqlPool.query(sql, [id]);
        return (rows as CustomIndexType[])[0] || null; // Return the first row or null if not found
    } catch (error) {
        console.error("Error fetching custom index by ID:", error);
        throw error;
    }
};

// ====== Get List (All Custom Indexes) ======
export const queryCustomIndexes = async (): Promise<CustomIndexType[]> => {
    try {
        const sql = `SELECT * FROM ${TABLE_NAME_CUSTOM_INDEX}`;
        const [rows] = await mySqlPool.query(sql);
        return rows as CustomIndexType[];
    } catch (error) {
        console.error("Error fetching custom index list:", error);
        throw error;
    }
};

// ====== Delete Custom Index and Related Assets by ID ======
export const deleteCustomIndexById = async (id: string): Promise<void> => {
    try {
        // Start a transaction
        const connection = await mySqlPool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete assets related to the CustomIndex (if applicable)
            const sqlDeleteAssets = `DELETE FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS} WHERE customIndexId = ?`;
            await connection.execute(sqlDeleteAssets, [id]);

            // Delete the CustomIndex itself
            const sqlDeleteIndex = `DELETE FROM ${TABLE_NAME_CUSTOM_INDEX} WHERE id = ?`;
            await connection.execute(sqlDeleteIndex, [id]);

            // Commit the transaction
            await connection.commit();
            console.log(`Custom index with ID '${id}' and its related assets were deleted successfully!`);
        } catch (err) {
            // Rollback the transaction in case of an error
            await connection.rollback();
            console.error("Error deleting custom index or its related assets:", err);
            throw err;
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error("Database error during deletion:", error);
        throw error;
    }
};
