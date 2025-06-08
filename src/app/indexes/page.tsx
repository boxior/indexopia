"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedAssets, getCachedTopAssets, getCustomIndexes} from "@/lib/db/helpers/db.helpers";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbQueryAssetHistoryById} from "@/lib/db/helpers/db.assetsHistory.helpers";
import {MAX_DB_CONNECTIONS} from "@/utils/constants/general.constants";
import {getUniqueCustomIndexesAssetIds} from "@/lib/db/helpers/db.customIndex.helpers";
import {dbQueryAssets} from "@/lib/db/helpers/db.assets.helpers";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    const assets = await dbQueryAssets();

    // precache all histories, so that in the nested helpers it will be taken from cache as we use `use cache` directive.
    // Later, in any queries it will be taken from cache.
    // await Promise.all(
    //     assets.map(({id: assetId}) => {
    //         return (async () => {
    //             try {
    //                 return dbQueryAssetHistoryById(assetId);
    //             } catch {
    //                 return [];
    //             }
    //         })();
    //     })
    // );

    const customIndexes = await getCustomIndexes();

    return <IndexesTable data={customIndexes} assets={assets} />;
};
