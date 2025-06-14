import {mySqlPool} from "@/lib/db";
import {IndexOverview} from "@/utils/types/general.types";
import {ENV_VARIABLES} from "@/env";

const TABLE_NAME_CUSTOM_INDEX_OVERVIEW = ENV_VARIABLES.MYSQL_TABLE_NAME_CUSTOM_INDEX_OVERVIEW; // Ensure your database table exists

// Insert an IndexOverview record into the database
const dbPostIndexOverview = async (data: Omit<IndexOverview, "id">): Promise<number | null> => {
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
const dbGetListIndexOverview = async (): Promise<IndexOverview[] | null> => {
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
            FROM IndexOverview;
        `;

        const [rows] = await mySqlPool.execute(query);
        const indexOverviews = rows as Array<{
            id: number;
            name: string;
            historyOverview: string; // JSON stored as string in the DB
            maxDrawDown: string; // JSON stored as string in the DB
            assets: string; // JSON stored as string in the DB
            startTime: number;
            endTime: number;
            isSystem: number; // Stored as tinyint in the DB
        }>;

        // Parse JSON fields and normalize `isSystem`
        const result: IndexOverview[] = indexOverviews.map(item => ({
            id: item.id,
            name: item.name,
            historyOverview: JSON.parse(item.historyOverview), // Parse JSON
            maxDrawDown: JSON.parse(item.maxDrawDown), // Parse JSON
            assets: JSON.parse(item.assets), // Parse JSON array of assets
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            isSystem: !!item.isSystem, // Convert tinyint to boolean
        }));

        return result; // Return the parsed array of IndexOverview items
    } catch (error) {
        console.error("Error fetching all IndexOverview records:", error);
        return null;
    }
};
