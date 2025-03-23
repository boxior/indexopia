"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex, handleGetAllAssetsHistories} from "@/app/db/db.helpers";
import {DefaultIndexBy, IndexId} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";
import {getLessLossesIndexAssets} from "@/utils/heleprs/generators/drawdown/getLessDrawDownIndexAssets.helper";
import {handleGetAssetsForIndex} from "@/utils/heleprs/generators/handleGetAssetsForIndex.helper";
import {pick} from "lodash";
import {getMostProfitableAssets} from "@/utils/heleprs/generators/getMostProfitableIndexAssets.helper";

export default async function IndexesPage() {
    await handleGetAllAssetsHistories();

    // const inputAssets = await handleGetAssetsForIndex({topAssetsCount: 10});
    // const assetsWithLosses = await getLessLossesIndexAssets({assets: inputAssets, upToNumber: 10});
    //
    // const assetsMoreProfitable = await getMostProfitableAssets({assets: inputAssets, upToNumber: 5});
    // const assetsMoreProfitableByLosses = await getMostProfitableAssets({assets: assetsWithLosses, upToNumber: 5});
    // console.log(
    //     "assetsWithLosses",
    //     assetsWithLosses.map(asset => ({
    //         ...pick(asset, ["id", "name", "rank", "maxDrawDown"]),
    //         history: asset.history?.length,
    //     }))
    // );
    // console.log(
    //     "assetsMoreProfitable",
    //     assetsMoreProfitable.map(asset => ({
    //         ...pick(asset, ["id", "name", "rank", "profit"]),
    //         history: asset.history?.length,
    //     }))
    // );
    // console.log(
    //     "assetsMoreProfitableByLosses",
    //     assetsMoreProfitableByLosses.map(asset => ({
    //         ...pick(asset, ["id", "name", "rank", "profit"]),
    //         history: asset.history?.length,
    //     }))
    // );
    // const outputAssets = await handleGenerateDefaultIndexFromScratch({
    //     topAssetsCount: 10,
    //     upToNumber: 5,
    //     defaultIndexBy: DefaultIndexBy.RANK_AND_PROFIT,
    // });
    //
    // console.log(
    //     "outputAssets",
    //     outputAssets.map(asset => ({
    //         id: asset.id,
    //         name: asset.name,
    //         portion: asset.portion,
    //         rank: asset.rank,
    //         profit: asset.profit,
    //     }))
    // );

    const data = await Promise.all(Object.values(IndexId).map(id => getIndex(id)));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);

    return <IndexesTable data={[...data, ...customIndexes]} assets={assets} />;
}
