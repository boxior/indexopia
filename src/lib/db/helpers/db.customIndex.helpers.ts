import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {CustomIndexAsset, CustomIndexAssetWithCustomIndexId, CustomIndexType} from "@/utils/types/general.types";

const TABLE_NAME_CUSTOM_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX; // Ensure your database table exists
const TABLE_NAME_CUSTOM_INDEX_ASSETS = ENV_VARIABLES.TABLE_NAME_CUSTOM_INDEX_ASSETS; // Ensure your database table exists

// Fetch a custom index by ID
const queryCustomIndexById = async (id: string) => {
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
};

// Fetch all custom indexes
export const queryCustomIndexes = async () => {
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
};

// Fetch assets belonging to a specific custom index
export const queryAssetsByCustomIndexId = async (customIndexId: string) => {
    const query = `
    SELECT 
      id,
      portion
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS}
    WHERE customIndexId = ?;
  `;

    const [rows] = await mySqlPool.execute(query, [customIndexId]);
    return rows as CustomIndexAssetWithCustomIndexId[]; // Return all assets for the custom index
};

// Fetch all assets across all custom indexes
export const queryCustomIndexAssets = async () => {
    const query = `
    SELECT 
      customIndexId,
      id,
      portion
    FROM ${TABLE_NAME_CUSTOM_INDEX_ASSETS};
  `;

    const [rows] = await mySqlPool.execute(query);
    return rows as CustomIndexAssetWithCustomIndexId[]; // Return the list of all assets
};

// Insert a custom index into the database
export const insertCustomIndex = async (id: string, name: string, startTime: number | null, isDefault: boolean) => {
    const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX} (id, name, startTime, isDefault)
    VALUES (?, ?, ?, ?);
  `;
    const isDefaultValue = isDefault ? 1 : 0;

    // Use all parameters including the `id` sent from the client
    const [result] = await mySqlPool.execute(query, [id, name, startTime, isDefaultValue]);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
};

// Insert assets associated with a custom index into the database
export const insertCustomIndexAssets = async (customIndexId: string, assets: CustomIndexAsset[]) => {
    const query = `
    INSERT INTO ${TABLE_NAME_CUSTOM_INDEX_ASSETS} (customIndexId, id, portion)
    VALUES ?;
  `;

    // Prepare the asset values for the query
    const values = assets.map(asset => [customIndexId, asset.id, asset.portion]);
    await mySqlPool.query(query, [values]); // Execute with the values
};

// Combined helper to create a custom index and its associated assets
export const handleInsertCustomIndex = async (customIndex: CustomIndexType) => {
    const {id, name, startTime, isDefault, assets} = customIndex;
    // Insert the custom index and get its ID
    await insertCustomIndex(id, name, startTime ?? null, !!isDefault);

    // If there are assets, insert them into the assets table
    if (assets.length > 0) {
        await insertCustomIndexAssets(id, assets);
    }

    return id; // Return the ID of the newly created custom index
};

// Fetch custom index details by ID, including its assets
export const handleQueryCustomIndexById = async (id: string): Promise<CustomIndexType | null> => {
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
};

// Fetch all custom indexes with their respective assets
export const handleQueryCustomIndexes = async (): Promise<CustomIndexType[]> => {
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
};
