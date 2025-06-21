import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {CustomIndexAsset, CustomIndexType, Id} from "@/utils/types/general.types";
import {revalidateTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";

const TABLE_NAME_CUSTOM_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX; // Ensure your database table exists
const TABLE_NAME_CUSTOM_INDEX_ASSETS = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX_OVERVIEW; // Ensure your database table exists

// Create a custom index into the database
export const dbPostCustomIndex = async (name: string, startTime: number | null, isSystem: boolean) => {
    try {
        const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX} (name, startTime, isSystem)
    VALUES (?, ?, ?);
`;

        const isSystemValue = isSystem ? 1 : 0;

        // Execute with parameters
        const [result] = await mySqlPool.execute(query, [name, startTime, isSystemValue]);

        return (result as any).insertId;
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Update a custom index in the database (throws error if entity does not exist)
export const dbPutCustomIndex = async (
    id: Id, // Assuming an "id" is provided for identifying the record
    name: string,
    startTime: number | null,
    isSystem: boolean
) => {
    try {
        // Step 1: Check if the entity exists
        const checkQuery = `
            SELECT COUNT(*) as count FROM ${TABLE_NAME_CUSTOM_INDEX} WHERE id = ?;
        `;
        const [rows] = await mySqlPool.execute(checkQuery, [id]);
        const count = (rows as {count: number}[])[0]?.count;

        if (count === 0) {
            throw new Error(`Entity with id ${id} does not exist.`);
        }

        // Step 2: Perform the update
        const updateQuery = `
            UPDATE ${TABLE_NAME_CUSTOM_INDEX}
            SET 
                name = ?,
                startTime = ?,
                isSystem = ?
            WHERE id = ?;
        `;

        const isSystemValue = isSystem ? 1 : 0;

        // Execute the update
        const [result] = await mySqlPool.execute(updateQuery, [name, startTime, isSystemValue, id]);

        return result as unknown as CustomIndexType;
    } catch (error) {
        console.error("Error updating custom index:", error);
        throw error;
    }
};

// Delete assets associated with a custom index from the database
export const dbDeleteCustomIndexAssets = async (customIndexId: Id) => {
    try {
        const query = `
    DELETE FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}
    WHERE customIndexId = ?;
  `;

        await mySqlPool.execute(query, [customIndexId]); // Execute the query with the provided customIndexId
    } catch (error) {
        console.error("Error deleting custom index assets:", error);
        throw error;
    }
};

// Insert assets associated with a custom index into the database
export const dbPostCustomIndexAssets = async (customIndexId: Id, assets: CustomIndexAsset[]) => {
    try {
        const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX_ASSETS} (customIndexId, assetId, portion)
    VALUES ?;
  `;

        // Prepare the asset values for the query
        const values = assets.map(asset => [customIndexId, asset.id, asset.portion]);
        await mySqlPool.query(query, [values]); // Execute with the values
    } catch (error) {
        console.error("Error inserting custom index assets:", error);
        throw error;
    }
};

// Combined helper to create a custom index and its associated assets
export const dbHandlePostCustomIndex = async (customIndex: Omit<CustomIndexType, "id">) => {
    try {
        const {name, startTime, isSystem, assets} = customIndex;
        // Insert the custom index and get its ID
        const id = await dbPostCustomIndex(name, startTime ?? null, !!isSystem);
        // If there are assets, insert them into the assets table
        if (assets.length > 0) {
            await dbPostCustomIndexAssets(id, assets);
        }

        return {id}; // Return the ID of the newly created custom index
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Combined helper to create a custom index and its associated assets
export const dbHandlePutCustomIndex = async (customIndex: CustomIndexType) => {
    try {
        const {id, name, startTime, isSystem, assets} = customIndex;
        // Insert the custom index and get its ID
        await dbPutCustomIndex(id, name, startTime ?? null, !!isSystem);

        await dbDeleteCustomIndexAssets(id);
        // If there are assets, insert them into the assets table
        if (assets.length > 0) {
            await dbPostCustomIndexAssets(id, assets);
        }

        return id; // Return the ID of the newly created custom index
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Deletes a custom index and its related assets
export const dbDeleteIndex = async (customIndexId: string): Promise<void> => {
    try {
        // Start a transaction to ensure both delete operations are atomic
        const connection = await mySqlPool.getConnection();

        try {
            await connection.beginTransaction();

            // Delete assets associated with the custom index
            const deleteAssetsQuery = `
        DELETE FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}
        WHERE customIndexId = ?;
      `;
            await connection.execute(deleteAssetsQuery, [customIndexId]);

            // Delete the custom index itself
            const deleteCustomIndexQuery = `
        DELETE FROM ${TABLE_NAME_CUSTOM_INDEX}
        WHERE id = ?;
      `;
            await connection.execute(deleteCustomIndexQuery, [customIndexId]);

            // Commit the transaction
            await connection.commit();
        } catch (error) {
            // Rollback the transaction on error
            await connection.rollback();
            console.error("Error during deleteCustomIndex transaction:", error);
            throw error;
        } finally {
            // Release the connection
            connection.release();
        }

        revalidateTag(CacheTag.INDEX_OVERVIEW);
    } catch (error) {
        console.error("Error deleting custom index and its related assets:", error);
        throw error;
    }
};
