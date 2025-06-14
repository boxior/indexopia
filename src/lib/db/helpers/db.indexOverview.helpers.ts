import {mySqlPool} from "@/lib/db";
import {Id, IndexOverview} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";
import {connection} from "next/server";
import {cacheTag} from "next/dist/server/use-cache/cache-tag";
import {CacheTag} from "@/utils/cache/constants.cache";

const TABLE_NAME_CUSTOM_INDEX_OVERVIEW = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX_OVERVIEW; // Ensure your database table exists

// Insert an IndexOverview record into the database
export const dbPostIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<number | null> => {
    await connection();

    try {
        const query = `
            INSERT INTO ${TABLE_NAME_CUSTOM_INDEX_OVERVIEW}
            (
                name,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                isSystem
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.name,
            JSON.stringify(data.historyOverview || {}),
            JSON.stringify(data.maxDrawDown || {}),
            JSON.stringify(data.assets || []), // Serialize assets array as JSON
            data.startTime || null,
            data.endTime || null,
            data.isSystem || false,
        ];

        const [result] = await mySqlPool.execute(query, values);
        const insertId = (result as any).insertId; // Extract the auto-generated ID

        return insertId; // Return the generated ID
    } catch (error) {
        console.error("Error inserting IndexOverview record:", error);
        return null;
    }
};

// Fetch all IndexOverview items from the database
export const dbGetListIndexOverview = async (): Promise<IndexOverview[]> => {
    "use cache";
    cacheTag(CacheTag.INDEX_OVERVIEW);

    try {
        const query = `
            SELECT 
                id,
                name,
                historyOverview,
                maxDrawDown,
                assets,
                startTime,
                endTime,
                isSystem
            FROM ${TABLE_NAME_CUSTOM_INDEX_OVERVIEW};
        `;

        const [rows] = await mySqlPool.execute(query);
        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            historyOverview: IndexOverview["historyOverview"]; // JSON stored as string in the DB
            maxDrawDown: IndexOverview["maxDrawDown"]; // JSON stored as string in the DB
            assets: IndexOverview["assets"]; // JSON stored as string in the DB
            startTime: number;
            endTime: number;
            isSystem: number; // Stored as tinyint in the DB
        }>;

        // Parse JSON fields and normalize `isSystem`
        const result: IndexOverview[] = indexOverviews.map(item => ({
            id: item.id,
            name: item.name,
            historyOverview: item.historyOverview, // Parse JSON
            maxDrawDown: item.maxDrawDown, // Parse JSON
            assets: item.assets, // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            isSystem: !!item.isSystem, // Convert tinyint to boolean
        }));

        return result ?? []; // Return the parsed array of IndexOverview items
    } catch (error) {
        console.error("Error fetching all IndexOverview records:", error);
        return [];
    }
};

// Fetch an IndexOverview item from the database by ID
export const dbGetIndexOverviewById = async (id: Id): Promise<IndexOverview | null> => {
    "use cache";
    cacheTag(CacheTag.INDEX_OVERVIEW, id.toString());

    try {
        const query = `
            SELECT 
                *
            FROM ${TABLE_NAME_CUSTOM_INDEX_OVERVIEW}
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
            isSystem: number; // Stored as tinyint in the DB
        }>;

        if (indexOverviews.length === 0) {
            return null; // Return null if no record is found
        }

        const item = indexOverviews[0]; // Get the first (and only) record

        // Parse JSON fields and normalize `isSystem`
        const result: IndexOverview = {
            id: item.id,
            name: item.name,
            historyOverview: item.historyOverview, // Parse JSON
            maxDrawDown: item.maxDrawDown, // Parse JSON
            assets: item.assets, // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            isSystem: !!item.isSystem, // Convert tinyint to boolean
        };

        return result; // Return the parsed IndexOverview item
    } catch (error) {
        console.error(`Error fetching IndexOverview with id ${id}:`, error);
        return null; // Return null if there's an error
    }
};
