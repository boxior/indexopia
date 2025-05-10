import {IndexHistory} from "@/utils/types/general.types";
import {mySqlPool} from "@/lib/db";
import {ENV_VARIABLES} from "@/env";

export const TABLE_NAME_INDEX_HISTORY = ENV_VARIABLES.MYSQL_TABLE_NAME_INDEX_HISTORY; // Ensure your database table exists

export type DbCreateIndexHistory = {
    priceUsd: string;
    time: number;
    date: string;
};
export const dbCreateIndexHistories = async ({
    indexId,
    histories,
}: {
    indexId: string;
    histories: DbCreateIndexHistory[];
}) => {
    if (histories.length === 0) return; // No histories to insert

    const query = `
    INSERT INTO ${TABLE_NAME_INDEX_HISTORY} (indexId, priceUsd, time, date)
    VALUES ${histories.map(() => "(?, ?, ?, ?)").join(", ")};
  `;

    const values = histories.flatMap(history => [indexId, history.priceUsd, history.time, history.date]);

    const [result] = await mySqlPool.execute(query, values);
    const insertResult = result as {insertId: number};
    return insertResult.insertId; // Return the DB-generated insert ID if needed
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

export const dbDeleteIndexHistories = async (indexId: string) => {
    // Delete histories related to the index
    const deleteHistoriesQuery = `
        DELETE FROM ${TABLE_NAME_INDEX_HISTORY} WHERE indexId = ?;
    `;
    await mySqlPool.execute(deleteHistoriesQuery, [indexId]);
};
