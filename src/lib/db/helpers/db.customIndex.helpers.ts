import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {
    CustomIndexAsset,
    CustomIndexAssetWithCustomIndexId,
    CustomIndexType,
    CustomIndexTypeDb,
    Id,
} from "@/utils/types/general.types";
import {revalidateTag, unstable_cacheTag as cacheTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";
import {normalizeDbBoolean} from "@/lib/db/helpers/db.helpers";

const TABLE_NAME_CUSTOM_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX; // Ensure your database table exists
const TABLE_NAME_CUSTOM_INDEX_ASSETS = ENV_VARIABLES.TABLE_NAME_CUSTOM_INDEX_ASSETS; // Ensure your database table exists

// Fetch a custom index by ID
const dbQueryCustomIndexById = async (id: Id): Promise<Omit<CustomIndexType, "assets"> | null> => {
    try {
        const query = `
    SELECT 
      id,
      name,
      startTime,
      isDefault
    FROM ${TABLE_NAME_CUSTOM_INDEX}
    WHERE id = ?;
  `;

        const [rows] = await mySqlPool.execute(query, [id]);
        const customIndexes = rows as CustomIndexTypeDb[];

        return customIndexes.length
            ? normalizeDbBoolean<CustomIndexTypeDb, Omit<CustomIndexType, "assets">>(customIndexes[0], ["isDefault"])
            : null; // Return the first result or null if not found
    } catch (error) {
        console.error("Error fetching custom index by ID:", error);
        return null;
        // throw error;
    }
};

// Fetch all custom indexes
export const dbQueryCustomIndexes = async (): Promise<Omit<CustomIndexType, "assets">[]> => {
    try {
        const query = `
    SELECT 
      id,
      name,
      startTime,
      isDefault
    FROM ${TABLE_NAME_CUSTOM_INDEX};
  `;

        const [rows] = await mySqlPool.execute(query);
        return (rows as CustomIndexTypeDb[]).map(row => normalizeDbBoolean(row, ["isDefault"])) as Omit<
            CustomIndexType,
            "assets"
        >[]; // Return the list of indexes
    } catch (error) {
        console.error("Error fetching custom indexes:", error);
        return [];
        // throw error;
    }
};

// Fetch assets belonging to a specific custom index
export const dbQueryAssetsByCustomIndexId = async (customIndexId: Id) => {
    try {
        const query = `
    SELECT 
      assetId AS id,
      portion
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}
    WHERE customIndexId = ?;
  `;

        const [rows] = await mySqlPool.execute(query, [customIndexId]);
        return rows as CustomIndexAssetWithCustomIndexId[]; // Return all assets for the custom index
    } catch (error) {
        console.error("Error fetching assets by custom index ID:", error);
        return [];
        // throw error;
    }
};

// Fetch all assets across all custom indexes
export const dbQueryCustomIndexAssets = async () => {
    try {
        const query = `
    SELECT 
      assetId AS id, customIndexId, portion, createdAt, updatedAt
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS};
  `;

        const [rows] = await mySqlPool.execute(query);
        return rows as CustomIndexAssetWithCustomIndexId[]; // Return the list of all assets
    } catch (error) {
        console.error("Error fetching custom index assets:", error);
        return [];
        // throw error;
    }
};

// Create a custom index into the database
export const dbCreateCustomIndex = async (name: string, startTime: number | null, isDefault: boolean) => {
    try {
        const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX} (name, startTime, isDefault)
    VALUES (?, ?, ?);
`;

        const isDefaultValue = isDefault ? 1 : 0;

        // Execute with parameters
        const [result] = await mySqlPool.execute(query, [name, startTime, isDefaultValue]);

        return (result as any).insertId;
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Update a custom index in the database (throws error if entity does not exist)
export const dbUpdateCustomIndex = async (
    id: Id, // Assuming an "id" is provided for identifying the record
    name: string,
    startTime: number | null,
    isDefault: boolean
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
                isDefault = ?
            WHERE id = ?;
        `;

        const isDefaultValue = isDefault ? 1 : 0;

        // Execute the update
        const [result] = await mySqlPool.execute(updateQuery, [name, startTime, isDefaultValue, id]);

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
export const dbCreateCustomIndexAssets = async (customIndexId: Id, assets: CustomIndexAsset[]) => {
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
export const dbHandleCreateCustomIndex = async (customIndex: Omit<CustomIndexType, "id">) => {
    try {
        const {name, startTime, isDefault, assets} = customIndex;
        // Insert the custom index and get its ID
        const id = await dbCreateCustomIndex(name, startTime ?? null, !!isDefault);
        // If there are assets, insert them into the assets table
        if (assets.length > 0) {
            await dbCreateCustomIndexAssets(id, assets);
        }

        return {id}; // Return the ID of the newly created custom index
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Combined helper to create a custom index and its associated assets
export const dbHandleUpdateCustomIndex = async (customIndex: CustomIndexType) => {
    try {
        const {id, name, startTime, isDefault, assets} = customIndex;
        // Insert the custom index and get its ID
        await dbUpdateCustomIndex(id, name, startTime ?? null, !!isDefault);

        await dbDeleteCustomIndexAssets(id);
        // If there are assets, insert them into the assets table
        if (assets.length > 0) {
            await dbCreateCustomIndexAssets(id, assets);
        }

        return id; // Return the ID of the newly created custom index
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Fetch custom index details by ID, including its assets
export const dbHandleQueryCustomIndexById = async (id: Id): Promise<CustomIndexType | null> => {
    "use cache";
    cacheTag(combineTags(CacheTag.CUSTOM_INDEX, id));

    try {
        // Query custom index
        const customIndex = await dbQueryCustomIndexById(id);

        if (!customIndex) {
            return null; // Return null if the custom index is not found
        }

        // Query related assets
        const assets = await dbQueryAssetsByCustomIndexId(id);

        // Combine custom index and its assets
        return {
            ...customIndex,
            assets,
        };
    } catch (error) {
        console.error("Error fetching custom index by ID:", error);
        throw error;
    }
};

// Fetch all custom indexes with their respective assets
export const dbHandleQueryCustomIndexes = async (): Promise<CustomIndexType[]> => {
    try {
        // Query all custom indexes
        const customIndexes = await dbQueryCustomIndexes();

        // Query all assets
        const allAssets = await dbQueryCustomIndexAssets();

        // Group assets by custom index ID
        const assetsByCustomIndexId = allAssets.reduce(
            (group, asset) => {
                if (!group[asset.customIndexId]) {
                    group[asset.customIndexId] = [];
                }
                group[asset.customIndexId].push({
                    id: asset.id,
                    portion: asset.portion,
                });
                return group;
            },
            {} as Record<Id, CustomIndexAsset[]>
        );

        // Combine custom indexes and their grouped assets
        return customIndexes.map(customIndex => ({
            ...customIndex,
            assets: assetsByCustomIndexId[customIndex.id] ?? [],
        }));
    } catch (error) {
        console.error("Error fetching custom indexes:", error);
        throw error;
    }
};

// Deletes a custom index and its related assets
export const dbDeleteCustomIndex = async (customIndexId: string): Promise<void> => {
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

        revalidateTag(CacheTag.CUSTOM_INDEXES);
        revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, customIndexId));
    } catch (error) {
        console.error("Error deleting custom index and its related assets:", error);
        throw error;
    }
};

export async function dbGetUniqueCustomIndexesAssetIds() {
    const [rows] = (await mySqlPool.execute(
        `SELECT DISTINCT assetId FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}`
    )) as unknown as [{assetId: string}[]];

    return rows.map((row: {assetId: string}) => row.assetId);
}
