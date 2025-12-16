import {mySqlPool} from "@/lib/db";
import {Asset, AssetHistory, Id, IndexOverview} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {connection} from "next/server";
import {cacheTag} from "next/dist/server/use-cache/cache-tag";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineCacheTags} from "@/utils/cache/helpers.cache";
import {revalidateTag, revalidatePath} from "next/cache";
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";
import {MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES} from "@/utils/constants/general.constants";
import {chunk, flatten} from "lodash";
import {SYSTEM_INDICES_PROPS} from "@/app/api/populate/populate.constants";
import {handlePrepareToSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";
import moment from "moment/moment";
import {actionUpdateIndexOverview} from "@/app/[locale]/indices/[id]/actions";

const TABLE_NAME_INDICES_OVERVIEW = ENV_VARIABLES.MYSQL_TABLE_NAME_INDICES_OVERVIEW; // Ensure your database table exists

// Insert an IndexOverview record into the database
const dbPostUserIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<IndexOverview | null> => {
    await connection();

    try {
        const query = `
            INSERT INTO ${TABLE_NAME_INDICES_OVERVIEW}
            (
                name,
                startingBalance,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                userId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.name,
            data.startingBalance,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.userId || null,
        ];

        const [result] = await mySqlPool.execute(query, values);
        const insertId = (result as any).insertId; // Extract the auto-generated ID

        revalidateTag(combineCacheTags(CacheTag.USER_INDICES_OVERVIEW, data.userId), "max");

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
            INSERT INTO ${TABLE_NAME_INDICES_OVERVIEW}
            (
                name,
                startingBalance,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                systemId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.name,
            data.startingBalance,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.systemId || null,
        ];

        const [result] = await mySqlPool.execute(query, values);
        const insertId = (result as any).insertId; // Extract the auto-generated ID

        revalidateTag(CacheTag.SYSTEM_INDICES_OVERVIEW, "max");

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

export const dbGetIndicesOverview = async (userId?: string): Promise<IndexOverview[]> => {
    "use cache";
    if (userId) {
        cacheTag(
            CacheTag.INDICES_OVERVIEW,
            CacheTag.USER_INDICES_OVERVIEW,
            combineCacheTags(CacheTag.USER_INDICES_OVERVIEW, userId)
        );
    } else {
        cacheTag(CacheTag.INDICES_OVERVIEW, CacheTag.SYSTEM_INDICES_OVERVIEW);
    }

    try {
        // Base query
        let query = `
            SELECT 
                id,
                name,
                startingBalance,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                systemId,
                userId
            FROM ${TABLE_NAME_INDICES_OVERVIEW}
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
            startingBalance: string;
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
            startingBalance: parseFloat(item.startingBalance),
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

export const dbPutIndexOverview = async (
    data: IndexOverview,
    revalidateTags: boolean | undefined = true
): Promise<IndexOverview | null> => {
    await connection();

    try {
        const query = `
            UPDATE ${TABLE_NAME_INDICES_OVERVIEW}
            SET
                name = ?,
                startingBalance = ?,
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
            data.startingBalance || null,
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

        if (revalidateTags) {
            // Revalidate cache to reflect updates
            data.systemId && revalidateTag(CacheTag.SYSTEM_INDICES_OVERVIEW, "max");
            data.userId && revalidateTag(CacheTag.USER_INDICES_OVERVIEW, "max");
            revalidateTag(combineCacheTags(CacheTag.INDICES_OVERVIEW, data.id), "max");
        }

        return await dbGetIndexOverviewById(data.id);
    } catch (error) {
        console.error("Error updating IndexOverview record:", error);
        return null; // Return false if any error occurs
    }
};

export const dbDeleteSystemIndices = async (): Promise<boolean> => {
    await connection();

    try {
        const query = `
            DELETE FROM ${TABLE_NAME_INDICES_OVERVIEW}
            WHERE systemId IS NOT NULL
        `;

        const [result] = await mySqlPool.execute(query);

        // Check if rows were affected by the query
        const affectedRows = (result as any).affectedRows;

        revalidateTag(CacheTag.SYSTEM_INDICES_OVERVIEW, "max");

        return affectedRows > 0; // Return true if records were deleted, false otherwise
    } catch (error) {
        console.error("Error deleting system IndexOverview records:", error);
        return false; // Return false in case of any errors
    }
};

export const dbDeleteIndexOverview = async (id: Id): Promise<boolean> => {
    await connection();

    try {
        const existedIndexOverview = await dbGetIndexOverviewById(id);
        // Define the query to delete a record by id
        const query = `
            DELETE FROM ${TABLE_NAME_INDICES_OVERVIEW}
            WHERE id = ?
        `;

        // Execute the query with the provided id
        const [result] = await mySqlPool.execute(query, [id]);

        // Check if rows were affected by the query
        const affectedRows = (result as any).affectedRows;

        existedIndexOverview?.systemId && revalidateTag(CacheTag.SYSTEM_INDICES_OVERVIEW, "max");
        existedIndexOverview?.userId && revalidateTag(CacheTag.USER_INDICES_OVERVIEW, "max");
        revalidateTag(combineCacheTags(CacheTag.INDICES_OVERVIEW, existedIndexOverview?.id), "max");

        return affectedRows > 0; // Return true if the record was deleted, false otherwise
    } catch (error) {
        console.error(`Error deleting IndexOverview record with id ${id}:`, error);
        return false; // Return false in case of any errors
    }
};

// Fetch an IndexOverview item from the database by ID
export const dbGetIndexOverviewById = async (id: Id): Promise<IndexOverview | null> => {
    "use cache";
    cacheTag(CacheTag.INDICES_OVERVIEW, combineCacheTags(CacheTag.INDICES_OVERVIEW, id));

    try {
        const query = `
            SELECT
                *
            FROM ${TABLE_NAME_INDICES_OVERVIEW}
            WHERE id = ?;
        `;
        const [rows] = await mySqlPool.execute(query, [id]); // Parameterized query to prevent SQL injection

        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            startingBalance: string;
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
            startingBalance: parseFloat(item.startingBalance),
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
    cacheTag(
        CacheTag.INDICES_OVERVIEW,
        CacheTag.SYSTEM_INDICES_OVERVIEW,
        combineCacheTags(CacheTag.SYSTEM_INDICES_OVERVIEW, systemId)
    );

    try {
        const query = `
            SELECT
                *
            FROM ${TABLE_NAME_INDICES_OVERVIEW}
            WHERE systemId = ?;
        `;
        const [rows] = await mySqlPool.execute(query, [systemId]); // Parameterized query to prevent SQL injection

        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            startingBalance: string;
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
            startingBalance: parseFloat(item.startingBalance),
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

export const manageSystemIndices = async (
    allAssets: Asset[] | undefined = [],
    allAssetsHistory: AssetHistory[] | undefined = []
) => {
    try {
        const allTopAssets = sortRankIndexAssets(allAssets).slice(0, MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES);
        const normalizedAssetsHistory = allAssetsHistory.reduce(
            (acc, assetHistory) => {
                const hasNeededHistory = allTopAssets.some(item => item.id === assetHistory.assetId);

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

        const indicesToSave = [];
        const chunksProps = chunk(SYSTEM_INDICES_PROPS, 10);
        for (const chunk of chunksProps) {
            const indicesProps = await Promise.all(
                chunk.map(item =>
                    handlePrepareToSaveSystemIndexOverview(
                        item,
                        allTopAssets.slice(0, item.upToNumber ?? item.topAssetsCount),
                        normalizedAssetsHistory
                    )
                )
            );
            indicesToSave.push(...indicesProps);
        }

        const chunksToSave = chunk(indicesToSave, 10);
        for (const chunkToSave of chunksToSave) {
            await Promise.all(chunkToSave.map(item => dbPostIndexOverview(item)));
        }
    } catch (error) {
        console.log(error);
    }
};

export async function dbGetUniqueIndicesOverviewsAssetIds(): Promise<string[]> {
    const query = `
        SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(assets, '$[*].id')) AS assetIds
        FROM ${TABLE_NAME_INDICES_OVERVIEW};
    `;

    const [rows] = (await mySqlPool.execute(query)) as unknown as [{assetIds: string}[]]; // e.g. assetIds: "["bitcoin", "ethereum","]"

    // Flatten results in case JSON_EXTRACT returns a list for each row
    const uniqueAssetIds = new Set<string>();
    rows.forEach(row => {
        try {
            const assetIds = JSON.parse(row.assetIds ?? "[]") as string[];
            assetIds.forEach(assetId => uniqueAssetIds.add(assetId));
        } catch {}
    });

    return Array.from(uniqueAssetIds);
}
/**
 * This function will update the user indices to up-to-date history.
 */
export const handleUpdateIndicesToUpToDateHistory = async (indices: IndexOverview[], revalidateTags?: boolean) => {
    const upToDateStartOfTheDay = moment().utc().add(-1, "day").startOf("day").valueOf();

    const chunks = chunk(indices, 10);

    const upToDateIndices: IndexOverview[] = flatten(
        await Promise.all(
            chunks.map(ch =>
                Promise.all(
                    ch.map(async indexOverview => {
                        if (!!indexOverview.endTime && indexOverview.endTime <= upToDateStartOfTheDay) {
                            // update index overview
                            return (await actionUpdateIndexOverview(indexOverview, revalidateTags)) ?? indexOverview;
                        }

                        return indexOverview;
                    })
                )
            )
        )
    );

    return upToDateIndices;
};
