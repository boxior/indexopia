import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {Asset, IndexAssetDb, IndexHistory, IndexId, IndexOverview, MaxDrawDown} from "@/utils/types/general.types";
import {TABLE_NAME_INDEX_HISTORY} from "@/lib/db/helpers/db.indexHistory.helpers";
import {HistoryOverview} from "@/lib/db/helpers/db.helpers";

export const TABLE_NAME_INDEX_ASSET = ENV_VARIABLES.MYSQL_TABLE_NAME_INDEX_ASSET; // Ensure your database table exists
export const MYSQL_TABLE_NAME_ASSETS = ENV_VARIABLES.MYSQL_TABLE_NAME_ASSETS; // Ensure your database table exists

export type DbCreateIndexAsset = {
    id: string;
    portion: number;
    historyOverview: HistoryOverview;
    maxDrawDown: MaxDrawDown;
};
export const dbCreateIndexAssets = async ({
    indexId,
    assets,
}: {
    indexId: IndexId | string;
    assets: DbCreateIndexAsset[];
}) => {
    if (assets.length === 0) return; // No assets to insert

    const query = `
    INSERT INTO ${TABLE_NAME_INDEX_ASSET} (id, indexId, portion, historyOverview, maxDrawDown)
    VALUES ${assets.map(() => "(?, ?, ?, ?, ?)").join(", ")};
  `;

    const values = assets.flatMap(asset => [
        asset.id,
        indexId,
        asset.portion,
        JSON.stringify(asset.historyOverview), // HistoryOverview as JSON
        JSON.stringify(asset.maxDrawDown), // MaxDrawDown as JSON
    ]);

    const [result] = await mySqlPool.execute(query, values);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
};

export const dbGetIndexOverviewAssets = async (indexId: string): Promise<IndexOverview["assets"]> => {
    // Query to get the related assets
    const query = `
        SELECT 
            id, 
        FROM ${TABLE_NAME_INDEX_ASSET}
        WHERE indexId = ?;
    `;

    // Execute the query
    const [assetsResult] = await mySqlPool.execute(query, [indexId]);
    const assetIds = (Array.isArray(assetsResult) ? assetsResult : []) as unknown as Pick<Asset, "id">[];
    if (assetIds.length === 0) {
        return []; // No assets found
    }

    // Extract the array of asset IDs
    const assetIdArray = assetIds.map(asset => asset.id);

    // Query to get the `name` of assets based on the retrieved array of ids
    const namesQuery = `
        SELECT 
            id, 
            name
        FROM ${MYSQL_TABLE_NAME_ASSETS}
        WHERE id IN (${assetIdArray.map(() => "?").join(",")});
    `;

    // Execute the query to fetch the names
    const [namesResult] = await mySqlPool.execute(namesQuery, assetIdArray);
    const namesData = (Array.isArray(namesResult) ? namesResult : []) as Array<{
        id: string;
        name: string;
    }>;

    // Construct the result by mapping each asset ID to its name
    return namesData.map(asset => ({
        id: asset.id,
        name: asset.name,
    }));
};

export const dbDeleteIndexAssets = async (indexId: string) => {
    // Delete assets related to the index
    const deleteAssetsQuery = `
        DELETE FROM ${TABLE_NAME_INDEX_ASSET} WHERE indexId = ?;
    `;
    await mySqlPool.execute(deleteAssetsQuery, [indexId]);
};
