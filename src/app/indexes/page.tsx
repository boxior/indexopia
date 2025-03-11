"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/app/api/assets/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export default async function IndexesPage() {
    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);

    return <IndexesTable data={[...data, ...customIndexes]} assets={assets} />;
}
