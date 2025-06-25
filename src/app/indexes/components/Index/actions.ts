"use server";

import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";

export const handleGetAssets = async () => {
    return await dbGetAssets();
};
