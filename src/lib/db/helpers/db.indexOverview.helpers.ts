import {mySqlPool} from "@/lib/db";
import {Asset, AssetHistory, Id, IndexOverview} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {connection} from "next/server";
import {cacheTag} from "next/dist/server/use-cache/cache-tag";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";
import {revalidateTag} from "next/cache";
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";
import {MAX_ASSETS_COUNT} from "@/utils/constants/general.constants";
import {chunk} from "lodash";
import {SYSTEM_INDEXES_PROPS} from "@/app/api/populate/populate.constants";
import {handlePrepareToSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";

const TABLE_NAME_INDEXES_OVERVIEW = ENV_VARIABLES.MYSQL_TABLE_NAME_INDEXES_OVERVIEW; // Ensure your database table exists

// Insert an IndexOverview record into the database
const dbPostUserIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<IndexOverview | null> => {
    await connection();

    try {
        const query = `
            INSERT INTO ${TABLE_NAME_INDEXES_OVERVIEW}
            (
                name,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                userId
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.name,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.userId || null,
        ];

        const [result] = await mySqlPool.execute(query, values);
        const insertId = (result as any).insertId; // Extract the auto-generated ID

        revalidateTag(CacheTag.INDEXES_OVERVIEW);

        return await dbGetIndexOverviewById(insertId);
    } catch (error) {
        console.error("Error inserting IndexOverview record:", error);
        return null;
    }
};

const dbPostSystemIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<IndexOverview | null> => {
    await connection();

    try {
        const existedSystemIndexOverview = await dbGetIndexOverviewBySystemId(data.systemId ?? "");

        if (existedSystemIndexOverview) {
            return await dbPutIndexOverview({id: existedSystemIndexOverview.id, ...data});
        }

        const query = `
            INSERT INTO ${TABLE_NAME_INDEXES_OVERVIEW}
            (
                name,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                systemId
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.name,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.systemId || null,
        ];

        const [result] = await mySqlPool.execute(query, values);
        const insertId = (result as any).insertId; // Extract the auto-generated ID

        revalidateTag(CacheTag.INDEXES_OVERVIEW);

        return await dbGetIndexOverviewById(insertId);
    } catch (error) {
        console.error("Error inserting IndexOverview record:", error);
        return null;
    }
};

export const dbPostIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<IndexOverview | null> => {
    switch (true) {
        case !!data.systemId:
            return await dbPostSystemIndexOverview(data);
        case !!data.userId:
            return await dbPostUserIndexOverview(data);
        default:
            throw new Error("No systemId or userId provided");
    }
};

// Fetch IndexOverview items from the database based on isSystem parameter
export const dbGetIndexesOverview = async (userId?: string): Promise<IndexOverview[]> => {
    "use cache";
    cacheTag(CacheTag.INDEXES_OVERVIEW, userId ? CacheTag.USER_INDEXES_OVERVIEW : CacheTag.SYSTEM_INDEXES_OVERVIEW);

    try {
        // Base query
        let query = `
            SELECT 
                id,
                name,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                systemId,
                userId
            FROM ${TABLE_NAME_INDEXES_OVERVIEW}
        `;

        const values: any[] = [];
        if (userId) {
            query += ` WHERE userId = ?`;
            values.push(userId);
        } else {
            query += ` WHERE systemId IS NOT NULL`;
        }

        // Execute the query
        const [rows] = await mySqlPool.execute(query, values);
        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            historyOverview: IndexOverview["historyOverview"]; // JSON stored as string in the DB
            maxDrawDown: IndexOverview["maxDrawDown"]; // JSON stored as string in the DB
            assets: IndexOverview["assets"]; // JSON stored as string in the DB
            startTime: number;
            endTime: number;
            systemId?: string;
            userId?: string;
        }>;

        // Parse JSON fields and normalize
        const result: IndexOverview[] = indexOverviews.map(item => ({
            id: item.id,
            name: item.name,
            historyOverview: item.historyOverview, // Parse JSON
            maxDrawDown: item.maxDrawDown, // Parse JSON
            assets: item.assets, // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            systemId: item.systemId || undefined,
            userId: item.userId || undefined,
        }));

        return result ?? []; // Return the parsed array of IndexOverview items
    } catch (error) {
        console.error("Error fetching IndexOverview records:", error);
        return [];
    }
};

export const dbPutIndexOverview = async (data: IndexOverview): Promise<IndexOverview | null> => {
    await connection();

    try {
        const query = `
            UPDATE ${TABLE_NAME_INDEXES_OVERVIEW}
            SET
                name = ?,
                historyOverview = ?,
                maxDrawDown = ?,
                assets = ?,
                startTime = ?,
                endTime = ?,
                systemId = ?,
                userId = ?
            WHERE id = ?
        `;

        const values = [
            data.name || null,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.systemId || null,
            data.userId || null,
            data.id, // Add the ID for the WHERE clause
        ];

        await mySqlPool.execute(query, values);

        // Revalidate cache to reflect updates
        const indexOverviewTag = data.systemId
            ? combineTags(CacheTag.SYSTEM_INDEXES_OVERVIEW, data.id)
            : data.userId
              ? combineTags(CacheTag.USER_INDEXES_OVERVIEW, data.id)
              : CacheTag.INDEXES_OVERVIEW;

        revalidateTag(indexOverviewTag);

        return await dbGetIndexOverviewById(data.id);
    } catch (error) {
        console.error("Error updating IndexOverview record:", error);
        return null; // Return false if any error occurs
    }
};

export const dbDeleteSystemIndexes = async (): Promise<boolean> => {
    await connection();

    try {
        const query = `
            DELETE FROM ${TABLE_NAME_INDEXES_OVERVIEW}
            WHERE systemId IS NOT NULL
        `;

        const [result] = await mySqlPool.execute(query);

        // Check if rows were affected by the query
        const affectedRows = (result as any).affectedRows;

        revalidateTag(CacheTag.INDEXES_OVERVIEW);

        return affectedRows > 0; // Return true if records were deleted, false otherwise
    } catch (error) {
        console.error("Error deleting system IndexOverview records:", error);
        return false; // Return false in case of any errors
    }
};

export const dbDeleteIndexOverview = async (id: Id): Promise<boolean> => {
    await connection();

    try {
        // Define the query to delete a record by id
        const query = `
            DELETE FROM ${TABLE_NAME_INDEXES_OVERVIEW}
            WHERE id = ?
        `;

        // Execute the query with the provided id
        const [result] = await mySqlPool.execute(query, [id]);

        // Check if rows were affected by the query
        const affectedRows = (result as any).affectedRows;

        revalidateTag(CacheTag.INDEXES_OVERVIEW);

        return affectedRows > 0; // Return true if the record was deleted, false otherwise
    } catch (error) {
        console.error(`Error deleting IndexOverview record with id ${id}:`, error);
        return false; // Return false in case of any errors
    }
};

// Fetch an IndexOverview item from the database by ID
export const dbGetIndexOverviewById = async (id: Id): Promise<IndexOverview | null> => {
    "use cache";
    cacheTag(CacheTag.INDEXES_OVERVIEW, combineTags(CacheTag.INDEXES_OVERVIEW, id));

    try {
        const query = `
            SELECT
                *
            FROM ${TABLE_NAME_INDEXES_OVERVIEW}
            WHERE id = ?;
        `;
        const [rows] = await mySqlPool.execute(query, [id]); // Parameterized query to prevent SQL injection

        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            historyOverview: IndexOverview["historyOverview"]; // JSON stored as string in the DB
            maxDrawDown: IndexOverview["maxDrawDown"]; // JSON stored as string in the DB
            assets: IndexOverview["assets"]; // JSON stored as string in the DB
            startTime: number;
            endTime: number;
            systemId?: string;
            userId?: string;
        }>;

        if (indexOverviews.length === 0) {
            return null; // Return null if no record is found
        }

        const item = indexOverviews[0]; // Get the first (and only) record

        // Parse JSON fields and normalize
        const result: IndexOverview = {
            id: item.id,
            name: item.name,
            historyOverview: item.historyOverview, // Parse JSON
            maxDrawDown: item.maxDrawDown, // Parse JSON
            assets: item.assets, // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            systemId: item.systemId || undefined,
            userId: item.userId || undefined,
        };

        return result; // Return the parsed IndexOverview item
    } catch (error) {
        console.error(`Error fetching IndexOverview with id ${id}:`, error);
        return null; // Return null if there's an error
    }
};

// Fetch an IndexOverview item from the database by ID
export const dbGetIndexOverviewBySystemId = async (systemId: Id): Promise<IndexOverview | null> => {
    "use cache";
    cacheTag(CacheTag.INDEXES_OVERVIEW, combineTags(CacheTag.INDEXES_OVERVIEW, systemId));

    try {
        const query = `
            SELECT
                *
            FROM ${TABLE_NAME_INDEXES_OVERVIEW}
            WHERE systemId = ?;
        `;
        const [rows] = await mySqlPool.execute(query, [systemId]); // Parameterized query to prevent SQL injection

        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            historyOverview: IndexOverview["historyOverview"]; // JSON stored as string in the DB
            maxDrawDown: IndexOverview["maxDrawDown"]; // JSON stored as string in the DB
            assets: IndexOverview["assets"]; // JSON stored as string in the DB
            startTime: number;
            endTime: number;
            systemId?: string;
        }>;

        if (indexOverviews.length === 0) {
            return null; // Return null if no record is found
        }

        const item = indexOverviews[0]; // Get the first (and only) record

        // Parse JSON fields and normalize
        const result: IndexOverview = {
            id: item.id,
            name: item.name,
            historyOverview: item.historyOverview, // Parse JSON
            maxDrawDown: item.maxDrawDown, // Parse JSON
            assets: item.assets, // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            systemId: item.systemId || undefined,
        };

        return result; // Return the parsed IndexOverview item
    } catch (error) {
        console.error(`Error fetching IndexOverview with systemId ${systemId}:`, error);
        return null; // Return null if there's an error
    }
};

export const handlePutIndexOverview = async (body: IndexOverview): Promise<Promise<IndexOverview | null>> => {
    await connection();

    return await dbPutIndexOverview(body);
};

export const manageSystemIndexes = async (
    allAssets: Asset[] | undefined = [],
    allAssetsHistory: AssetHistory[] | undefined = []
) => {
    try {
        const assets = sortRankIndexAssets(allAssets).slice(0, MAX_ASSETS_COUNT);
        const normalizedAssetsHistory = allAssetsHistory.reduce(
            (acc, assetHistory) => {
                const hasNeededHistory = assets.some(item => item.id === assetHistory.assetId);

                if (!hasNeededHistory) {
                    return acc;
                }

                return {
                    ...acc,
                    [assetHistory.assetId]: [...(acc[assetHistory.assetId] ?? []), assetHistory],
                };
            },
            {} as Record<string, AssetHistory[]>
        );

        const indexesToSave = [];
        const chunksProps = chunk(SYSTEM_INDEXES_PROPS, 10);
        for (const chunk of chunksProps) {
            const indexesProps = await Promise.all(
                chunk.map(item => handlePrepareToSaveSystemIndexOverview(item, assets, normalizedAssetsHistory))
            );
            indexesToSave.push(...indexesProps);
        }

        const chunksToSave = chunk(indexesToSave, 10);
        for (const chunkToSave of chunksToSave) {
            await Promise.all(chunkToSave.map(item => dbPostIndexOverview(item)));
        }
    } catch (error) {
        console.log(error);
    }
};

export async function dbGetUniqueIndexesOverviewsAssetIds(): Promise<string[]> {
    const query = `
        SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(assets, '$[*].id')) AS assetId
        FROM ${TABLE_NAME_INDEXES_OVERVIEW};
    `;

    const [rows] = (await mySqlPool.execute(query)) as unknown as [{assetId: string}[]];

    // Flatten results in case JSON_EXTRACT returns a list for each row
    const uniqueAssetIds = new Set<string>();
    rows.forEach(row => {
        const assetIds = row?.assetId ? row.assetId.split(",") : [];
        assetIds.forEach(assetId => uniqueAssetIds.add(assetId.trim()));
    });

    return Array.from(uniqueAssetIds);
}
