"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes} from "@/lib/db/helpers/db.helpers";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbQueryAssetHistoryById} from "@/lib/db/helpers/db.assetsHistory.helpers";
import {unstable_cacheTag as cacheTag} from "next/cache";

export default async function IndexesPage() {
    "use cache";
    cacheTag("indexesPage");

    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    "use cache";
    cacheTag("indexesPage_suspended");

    const assets = await getCachedTopAssets();

    // precache all histories, so that in the nested helpers it will be taken from cache as we use `use cache` directive.
    // Later, in any queries it will be taken from cache.
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

    const customIndexes = await getCustomIndexes();

    return <IndexesTable data={[...[], ...customIndexes]} assets={assets} />;
};
