"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbQueryAssets} from "@/lib/db/helpers/db.assets.helpers";
import {dbGetListIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    const assets = await dbQueryAssets();
    // // precache all histories, so that in the nested helpers it will be taken from cache as we use `use cache` directive.
    // // Later, in any queries it will be taken from cache.
    // await Promise.all(
    //     assets.slice(0, 50).map(({id: assetId}) => {
    //         return (async () => {
    //             try {
    //                 return dbQueryAssetHistoryById(assetId);
    //             } catch {
    //                 return [];
    //             }
    //         })();
    //     })
    // );

    // const customIndexes = await getCustomIndexes();
    const customIndexes = await dbGetListIndexOverview();

    return <IndexesTable data={customIndexes} assets={assets} />;
};
