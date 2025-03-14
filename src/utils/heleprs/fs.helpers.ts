import {promises as fs} from "fs";
import {uniqBy} from "lodash";
import {RecordWithId} from "@/utils/types/general.types";
import path from "path";

/**
 * This file is useful to test locally jsons.
 */
export async function readJsonFile(fileName: string, fallback: unknown = [], folderPath: string | undefined = "/db") {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        const filePath = `${process.cwd()}${folderPath}`;

        const path = `${filePath}/${fileName}.json`;

        try {
            await fs.access(path);
        } catch {
            return fallback;
        }

        // Read the JSON file
        const data = await fs.readFile(path, "utf8");
        // Parse the JSON data
        return JSON.parse(data) as unknown;
    } catch (error) {
        console.error(`Error reading JSON file ${fileName}:`, error);
    }
}

export async function writeJsonFile<T>(fileName: string, data: T, folderPath: string | undefined = "/db") {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        // Convert JavaScript object to JSON string
        const jsonData = JSON.stringify(data, null, 2);
        const filePath = `${process.cwd()}${folderPath}`;

        await createFolderIfNotExists(filePath);
        // Write JSON string to file
        await fs.writeFile(`${filePath}/${fileName}.json`, jsonData, "utf8");
        console.log(`JSON file "${fileName}" has been written successfully.`);
    } catch (error) {
        console.error(`Error writing JSON file "${fileName}":`, error);
    }
}

export const createFolderIfNotExists = async (folderPath: string) => {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        // Check if the folder exists
        await fs.access(folderPath);
    } catch {
        // If the folder doesn't exist, create it
        await fs.mkdir(folderPath);
    }
};

export const readJsonItemFromArray = async (id: RecordWithId["id"], fileName: string, folderPath?: string) => {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        const items = (await readJsonFile(fileName, [], folderPath)) as RecordWithId[];

        return items.find(item => item.id === id);
    } catch (error) {
        console.error("readJsonItemFromArray error", error);
    }
};

export const writeJsonItemToArray = async (
    item: RecordWithId,
    fileName: string,
    folderPath?: string,
    forceUnique: boolean | undefined = false
) => {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        const items = (await readJsonFile(fileName, [], folderPath)) as RecordWithId[];
        const newItems = uniqBy([...items, item], item => item.id);

        if (forceUnique) {
            const isExisted = await getIfExistJsonItemInArray(item.id, fileName, folderPath);

            if (isExisted) {
                return;
            }
        }

        await writeJsonFile(fileName, newItems, folderPath);
    } catch (error) {
        console.error(`Error writing JSON file "${fileName}":`, error);
    }
};

export const getIfExistJsonItemInArray = async (id: string, fileName: string, folderPath?: string) => {
    // if (ENV_VARIABLES.MY_ENV !== "local") {
    //     return;
    // }

    try {
        const items = (await readJsonFile(fileName, [], folderPath)) as {id: string}[];

        return items.some(item => item.id === id);
    } catch {
        return false;
    }
};

/**
 * Processes all files in a folder and applies a callback to their content.
 *
 * @param folderPath - Absolute or relative path to the folder
 * @param callback - A callback function that processes each file's content
 */
export async function processFilesInFolder<T extends Record<string, unknown>>(
    folderPath: string | undefined = "/db",
    callback: (json: T, fileName: string) => void
): Promise<void> {
    try {
        // Resolve the absolute path of the folder
        const filesPath = `${process.cwd()}${folderPath}`;

        // Read all entries in the folder
        const files: string[] = await fs.readdir(filesPath);

        // Iterate over the files
        for (const file of files) {
            const filePath: string = path.join(filesPath, file);

            // Check if the entry is a file and not a directory
            const stat = await fs.lstat(filePath);
            if (stat.isFile()) {
                // Read the file contents
                const content: T = (await readJsonFile(file, {} as T, filesPath)) as T;

                // Call the callback function with file content and name
                callback(content, file);
            }
        }
    } catch (error) {
        console.error("Error processing files in folder:", error);
    }
}

export async function processAllFilesInFolder<T extends Record<string, unknown>>(
    folderPath: string | undefined = "/db"
): Promise<T[]> {
    try {
        // Resolve the absolute path of the folder
        const filesPath = `${process.cwd()}${folderPath}`;

        // Read all entries in the folder
        const files: string[] = await fs.readdir(filesPath);

        const promises: Promise<T>[] = [];

        // Iterate over the files
        for (const file of files) {
            const filePath: string = path.join(filesPath, file);

            // Check if the entry is a file and not a directory
            const stat = await fs.lstat(filePath);
            if (stat.isFile()) {
                const fileName = path.parse(file).name;

                const promise = readJsonFile(fileName, {} as T, folderPath) as Promise<T>;

                promises.push(promise);
            }
        }

        return Promise.all(promises);
    } catch (error) {
        console.error("Error processing files in folder:", error);
        throw error;
    }
}
