"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex, handleGetAllAssetsHistories} from "@/app/db/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";
import {getMostProfitableIndexAll} from "@/utils/heleprs/getMostProfitableIndexAssetsAll.helper";

export default async function IndexesPage() {
    await handleGetAllAssetsHistories();

    const inputAssets = await getCachedTopAssets(10, true);
    const outputAssets = getMostProfitableIndexAll(inputAssets, 3);
    console.log("outputAssets", outputAssets);

    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);

    return <IndexesTable data={[...data, ...customIndexes]} assets={assets} />;
}
