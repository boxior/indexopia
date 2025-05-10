import {ENV_VARIABLES} from "@/env";
import {mySqlPool} from "@/lib/db";
import {HistoryOverview} from "@/lib/db/helpers/db.helpers";
import {IndexDb, IndexOverview, MaxDrawDown} from "@/utils/types/general.types";
import {dbDeleteIndexAssets, dbGetIndexOverviewAssets} from "@/lib/db/helpers/db.indexAsset.helpers";
import {dbDeleteIndexHistories} from "@/lib/db/helpers/db.indexHistory.helpers";

const MYSQL_TABLE_NAME_INDEX = ENV_VARIABLES.MYSQL_TABLE_NAME_INDEX; // Ensure your database table exists

export type DbCreateIndex = {
    id: string;
    name: string;
    historyOverview: HistoryOverview;
    maxDrawDown: MaxDrawDown;
    startTime?: number | null;
    endTime?: number | null;
    isSystem?: boolean;
};
export const dbCreateIndex = async ({
    id,
    name,
    historyOverview,
    maxDrawDown,
    startTime = null,
    endTime = null,
    isSystem = false,
}: DbCreateIndex) => {
    const query = `
    INSERT INTO ${MYSQL_TABLE_NAME_INDEX} (id, name, historyOverview, maxDrawDown, startTime, endTime, isSystem)
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

export const deleteIndexAndRelations = async (indexId: string) => {
    await dbDeleteIndexAssets(indexId);

    await dbDeleteIndexHistories(indexId);

    // Delete the index itself
    const deleteIndexQuery = `
        DELETE FROM ${MYSQL_TABLE_NAME_INDEX} WHERE id = ?;
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
        FROM ${MYSQL_TABLE_NAME_INDEX}
        WHERE id = ?;
    `;

    // Execute the queries using the provided `indexId`
    const [indexResult] = await mySqlPool.execute(indexQuery, [indexId]);
    const indexData = (Array.isArray(indexResult) && indexResult.length > 0 ? indexResult[0] : null) as IndexDb | null;

    if (!indexData) return null; // If no index is found, return null

    const assets = await dbGetIndexOverviewAssets(indexId);

    // Map the data into the `IndexOverview` structure
    const indexOverview: IndexOverview = {
        id: indexData.id,
        name: indexData.name,
        assets, // Include id and name of assets
        historyOverview: JSON.parse(indexData.historyOverview), // Parse stored JSON
        maxDrawDown: JSON.parse(indexData.maxDrawDown), // Parse stored JSON
        startTime: indexData.startTime,
        endTime: indexData.endTime,
        isSystem: indexData.isSystem === 1, // Convert to boolean
    };

    return indexOverview;
};
