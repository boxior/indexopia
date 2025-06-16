"use server";

import {CustomIndexType} from "@/utils/types/general.types";
import {dbHandlePostCustomIndex, dbHandlePutCustomIndex} from "@/lib/db/helpers/db.index.helpers";
import {revalidateTag} from "next/cache";
import {CacheTag} from "@/utils/cache/constants.cache";
import {combineTags} from "@/utils/cache/helpers.cache";

export async function createCustomIndex(customIndex: Omit<CustomIndexType, "id">): Promise<CustomIndexType> {
    const {id} = await dbHandlePostCustomIndex(customIndex);

    revalidateTag(CacheTag.CUSTOM_INDEXES);
    revalidateTag(combineTags(CacheTag.INDEX, id));
    revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, id));
    return {id, ...customIndex};
}

export async function updateCustomIndex(customIndex: CustomIndexType): Promise<CustomIndexType> {
    await dbHandlePutCustomIndex(customIndex);

    revalidateTag(CacheTag.CUSTOM_INDEXES);
    revalidateTag(combineTags(CacheTag.INDEX, customIndex.id));
    revalidateTag(combineTags(CacheTag.CUSTOM_INDEX, customIndex.id));
    return customIndex;
}
