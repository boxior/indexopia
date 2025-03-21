"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex, handleGetAllAssetsHistories} from "@/app/db/db.helpers";
import {DefaultIndexBy, IndexId} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";
import {handleGetDefaultIndexFromScratch} from "@/utils/heleprs/handleGetDefaultIndexFromScratch.helper";
import moment from "moment";

export default async function IndexesPage() {
    await handleGetAllAssetsHistories();

    const outputAssets = await handleGetDefaultIndexFromScratch({
        topAssetsCount: 5,
        upToNumber: 3,
        defaultIndexBy: DefaultIndexBy.RANK_AND_PROFIT,
        startTime: moment().subtract(3, "year").valueOf(),
    });

    console.log(
        "outputAssets",
        outputAssets.map(asset => ({
            id: asset.id,
            name: asset.name,
            portion: asset.portion,
            rank: asset.rank,
            profit: asset.profit,
        }))
    );

    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);

    return <IndexesTable data={[...data, ...customIndexes]} assets={assets} />;
}
