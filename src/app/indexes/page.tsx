"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbQueryAssetHistoryById} from "@/lib/db/helpers/db.assetsHistory.helpers";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    // TODO: remove topIndexes features. Handle them as CustomIndexes
    // console.time("topIndexes");
    // const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    // console.timeEnd("topIndexes");

    console.time("assets");
    const assets = await getCachedTopAssets();
    console.timeEnd("assets");

    console.time("historyDatas");
    // precache all histories, so that in the nested helpers it will be taken from cache as we use `use cache` directive.
    await Promise.all(
        assets.map(({id: assetId}) => {
            return (async () => {
                try {
                    return dbQueryAssetHistoryById(assetId);
                } catch {
                    return [];
                }
            })();
        })
    );
    console.timeEnd("historyDatas");

    console.time("customIndexes");
    const customIndexes = await getCustomIndexes();
    console.timeEnd("customIndexes");

    return <IndexesTable data={[...[], ...customIndexes]} assets={assets} />;
};
