"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getIndex} from "@/app/api/assets/db.helpers";
import {IndexId} from "@/utils/types/general.types";

export default async function IndexesPage() {
    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));
    const assets = await getCachedTopAssets(50);

    return <IndexesTable data={data} assets={assets} />;
}
