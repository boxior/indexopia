import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {HistoryOverview} from "@/lib/db/helpers/db.helpers";
import {Asset, IndexDb, IndexHistory, IndexOverview, MaxDrawDown} from "@/utils/types/general.types";

const TABLE_NAME_INDEX = ENV_VARIABLES.TABLE_NAME_INDEX; // Ensure your database table exists
const TABLE_NAME_INDEX_ASSET = ENV_VARIABLES.TABLE_NAME_INDEX_ASSET; // Ensure your database table exists
const TABLE_NAME_INDEX_HISTORY = ENV_VARIABLES.TABLE_NAME_INDEX_HISTORY; // Ensure your database table exists

export const dbCreateIndex = async ({
    id,
    name,
    historyOverview,
    maxDrawDown,
    startTime,
    endTime,
    isSystem = false,
}: {
    id: string;
    name: string;
    historyOverview: HistoryOverview;
    maxDrawDown: MaxDrawDown;
    startTime: number;
    endTime: number;
    isSystem?: boolean;
}) => {
    const query = `
    INSERT INTO ${TABLE_NAME_INDEX} (id, name, historyOverview, maxDrawDown, startTime, endTime, isSystem)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
    const isSystemValue = isSystem ? 1 : 0; // Convert isSystem to 1, 0, or NULL

    const [result] = await mySqlPool.execute(query, [
        id,
        name,
        JSON.stringify(historyOverview), // HistoryOverview as JSON
        JSON.stringify(maxDrawDown), // MaxDrawDown as JSON
        startTime,
        endTime,
        isSystemValue,
    ]);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
};

export const dbCreateIndexAssets = async (
    assets: Array<{
        id: string;
        indexId: string;
        portion: number;
        historyOverview: object;
        maxDrawDown: object;
    }>
) => {
    if (assets.length === 0) return; // No assets to insert

    const query = `
    INSERT INTO ${TABLE_NAME_INDEX_ASSET} (id, indexId, portion, historyOverview, maxDrawDown)
    VALUES ${assets.map(() => "(?, ?, ?, ?, ?)").join(", ")};
  `;

    const values = assets.flatMap(asset => [
        asset.id,
        asset.indexId,
        asset.portion,
        JSON.stringify(asset.historyOverview), // HistoryOverview as JSON
        JSON.stringify(asset.maxDrawDown), // MaxDrawDown as JSON
    ]);

    const [result] = await mySqlPool.execute(query, values);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
};

export const dbCreateIndexHistories = async (
    histories: Array<{
        indexId: string;
        priceUsd: string;
        time: number;
        date: string;
    }>
) => {
    if (histories.length === 0) return; // No histories to insert

    const query = `
    INSERT INTO ${TABLE_NAME_INDEX_HISTORY} (indexId, priceUsd, time, date)
    VALUES ${histories.map(() => "(?, ?, ?, ?)").join(", ")};
  `;

    const values = histories.flatMap(history => [history.indexId, history.priceUsd, history.time, history.date]);

    const [result] = await mySqlPool.execute(query, values);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
};

export const dbDeleteIndexAssets = async (indexId: string) => {
    // Delete assets related to the index
    const deleteAssetsQuery = `
        DELETE FROM ${TABLE_NAME_INDEX_ASSET} WHERE indexId = ?;
    `;
    await mySqlPool.execute(deleteAssetsQuery, [indexId]);
};

export const dbDeleteIndexHistories = async (indexId: string) => {
    // Delete histories related to the index
    const deleteHistoriesQuery = `
        DELETE FROM ${TABLE_NAME_INDEX_HISTORY} WHERE indexId = ?;
    `;
    await mySqlPool.execute(deleteHistoriesQuery, [indexId]);
};

export const deleteIndexAndRelations = async (indexId: string) => {
    await dbDeleteIndexAssets(indexId);

    await dbDeleteIndexHistories(indexId);

    // Delete the index itself
    const deleteIndexQuery = `
        DELETE FROM ${TABLE_NAME_INDEX} WHERE id = ?;
    `;
    const [result] = await mySqlPool.execute(deleteIndexQuery, [indexId]);
    const deleteResult = result as {affectedRows: number};

    return deleteResult.affectedRows > 0; // Return true if the index was successfully deleted
};

export const dbGetIndexOverview = async (indexId: string): Promise<IndexOverview | null> => {
    // Query to get the main index details
    const indexQuery = `
        SELECT 
            id, 
            name, 
            historyOverview, 
            maxDrawDown, 
            startTime, 
            endTime, 
            isSystem
        FROM ${TABLE_NAME_INDEX}
        WHERE id = ?;
    `;

    // Query to get the related assets
    const assetsQuery = `
        SELECT 
            id, 
            name
        FROM ${TABLE_NAME_INDEX_ASSET}
        WHERE indexId = ?;
    `;

    // Execute the queries using the provided `indexId`
    const [indexResult] = await mySqlPool.execute(indexQuery, [indexId]);
    const indexData = (Array.isArray(indexResult) && indexResult.length > 0 ? indexResult[0] : null) as IndexDb | null;

    if (!indexData) return null; // If no index is found, return null

    const [assetsResult] = await mySqlPool.execute(assetsQuery, [indexId]);
    const assetsData = (Array.isArray(assetsResult) ? assetsResult : []) as unknown as Pick<Asset, "id" | "name">[];

    // Map the data into the `IndexOverview` structure
    const indexOverview: IndexOverview = {
        id: indexData.id,
        name: indexData.name,
        assets: assetsData.map(asset => ({
            id: asset.id,
            name: asset.name,
        })), // Include id and name of assets
        historyOverview: JSON.parse(indexData.historyOverview), // Parse stored JSON
        maxDrawDown: JSON.parse(indexData.maxDrawDown), // Parse stored JSON
        startTime: indexData.startTime,
        endTime: indexData.endTime,
        isSystem: indexData.isSystem === 1, // Convert to boolean
    };

    return indexOverview;
};

export const dbGetIndexHistory = async ({
    indexId,
    startTime,
    endTime,
}: {
    indexId: string;
    startTime: number;
    endTime: number;
}): Promise<IndexHistory[]> => {
    // Query to fetch historical data within the specified time range
    const query = `
        SELECT 
            priceUsd, 
            time, 
            date
        FROM ${TABLE_NAME_INDEX_HISTORY}
        WHERE indexId = ?
        AND time BETWEEN ? AND ?
        ORDER BY time ASC;
    `;

    // Execute the query
    const [results] = await mySqlPool.execute(query, [indexId, startTime, endTime]);
    return (Array.isArray(results) ? results : []) as IndexHistory[];
};
