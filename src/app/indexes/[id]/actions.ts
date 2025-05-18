"use server";

import {CustomIndexType} from "@/utils/types/general.types";
import {dbHandleInsertCustomIndex} from "@/lib/db/helpers/db.customIndex.helpers";
import {revalidateTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";

export async function saveCustomIndex(customIndex: CustomIndexType): Promise<CustomIndexType> {
    await dbHandleInsertCustomIndex(customIndex);

    revalidateTag(CacheTag.CUSTOM_INDEXES);
    revalidateTag(combineTags(CacheTag.INDEX, customIndex.id));
    revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, customIndex.id));
    return customIndex;
}
