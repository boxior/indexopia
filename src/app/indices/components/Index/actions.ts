"use server";

import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";

export const actionGetAssets = async () => {
    return await dbGetAssets();
};
