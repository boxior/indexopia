"use server";

import {CustomIndexType} from "@/utils/types/general.types";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {INDEXES_FOLDER_PATH} from "@/app/api/assets/db.helpers";

export async function saveCustomIndex(customIndex: CustomIndexType): Promise<CustomIndexType> {
    await writeJsonFile(customIndex.id, customIndex, INDEXES_FOLDER_PATH);

    return customIndex;
}
