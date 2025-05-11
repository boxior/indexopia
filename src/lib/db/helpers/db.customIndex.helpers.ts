import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {CustomIndexAsset, CustomIndexAssetWithCustomIndexId, CustomIndexType} from "@/utils/types/general.types";
import {cacheTag} from "next/dist/server/use-cache/cache-tag";
import {CacheTag} from "@/utils/cache/constants.cache";

const TABLE_NAME_CUSTOM_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX; // Ensure your database table exists
const TABLE_NAME_CUSTOM_INDEX_ASSETS = ENV_VARIABLES.TABLE_NAME_CUSTOM_INDEX_ASSETS; // Ensure your database table exists

// Fetch a custom index by ID
const queryCustomIndexById = async (id: string) => {
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
        const customIndexes = rows as Omit<CustomIndexType, "assets">[];

        return customIndexes.length ? customIndexes[0] : null; // Return the first result or null if not found
    } catch (error) {
        console.error("Error fetching custom index by ID:", error);
        throw error;
    }
};

// Fetch all custom indexes
export const queryCustomIndexes = async () => {
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
        return rows as Omit<CustomIndexType, "assets">[]; // Return the list of indexes
    } catch (error) {
        console.error("Error fetching custom indexes:", error);
        throw error;
    }
};

// Fetch assets belonging to a specific custom index
export const queryAssetsByCustomIndexId = async (customIndexId: string) => {
    try {
        const query = `
    SELECT 
      id,
      portion
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}
    WHERE customIndexId = ?;
  `;

        const [rows] = await mySqlPool.execute(query, [customIndexId]);
        return rows as CustomIndexAssetWithCustomIndexId[]; // Return all assets for the custom index
    } catch (error) {
        console.error("Error fetching assets by custom index ID:", error);
        throw error;
    }
};

// Fetch all assets across all custom indexes
export const queryCustomIndexAssets = async () => {
    try {
        const query = `
    SELECT 
      customIndexId,
      id,
      portion
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS};
  `;

        const [rows] = await mySqlPool.execute(query);
        return rows as CustomIndexAssetWithCustomIndexId[]; // Return the list of all assets
    } catch (error) {
        console.error("Error fetching custom index assets:", error);
        throw error;
    }
};

// Insert a custom index into the database
export const insertCustomIndex = async (id: string, name: string, startTime: number | null, isDefault: boolean) => {
    try {
        const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX} (id, name, startTime, isDefault)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      startTime = VALUES(startTime),
      isDefault = VALUES(isDefault);
  `;

        const isDefaultValue = isDefault ? 1 : 0;

        // Execute with parameters
        const [result] = await mySqlPool.execute(query, [id, name, startTime, isDefaultValue]);
        return result; // You can return the full result or part of it if needed
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Delete assets associated with a custom index from the database
export const deleteCustomIndexAssets = async (customIndexId: string) => {
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
export const insertCustomIndexAssets = async (customIndexId: string, assets: CustomIndexAsset[]) => {
    try {
        const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX_ASSETS} (customIndexId, id, portion)
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
export const handleInsertCustomIndex = async (customIndex: CustomIndexType) => {
    try {
        const {id, name, startTime, isDefault, assets} = customIndex;
        // Insert the custom index and get its ID
        await insertCustomIndex(id, name, startTime ?? null, !!isDefault);

        await deleteCustomIndexAssets(id);
        // If there are assets, insert them into the assets table
        if (assets.length > 0) {
            await insertCustomIndexAssets(id, assets);
        }

        return id; // Return the ID of the newly created custom index
    } catch (error) {
        console.error("Error inserting custom index:", error);
        throw error;
    }
};

// Fetch custom index details by ID, including its assets
export const handleQueryCustomIndexById = async (id: string): Promise<CustomIndexType | null> => {
    "use cache";
    cacheTag(`${CacheTag.CUSTOM_INDEX}_${id}`);

    try {
        // Query custom index
        const customIndex = await queryCustomIndexById(id);
        if (!customIndex) {
            return null; // Return null if the custom index is not found
        }

        // Query related assets
        const assets = await queryAssetsByCustomIndexId(id);

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
export const handleQueryCustomIndexes = async (): Promise<CustomIndexType[]> => {
    try {
        // Query all custom indexes
        const customIndexes = await queryCustomIndexes();

        // Query all assets
        const allAssets = await queryCustomIndexAssets();

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
            {} as Record<string, CustomIndexAsset[]>
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
