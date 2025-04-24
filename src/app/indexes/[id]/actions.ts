"use server";

import {CustomIndexType} from "@/utils/types/general.types";
import {handleInsertCustomIndex} from "@/lib/db/helpers/db.customIndex.helpers";

export async function saveCustomIndex(customIndex: CustomIndexType): Promise<CustomIndexType> {
    await handleInsertCustomIndex(customIndex);

    return customIndex;
}
