"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/app/db/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";
import {DefaultCustomIndex} from "@/app/indexes/components/DefaultCustomIndex";
import * as React from "react";

export default async function IndexesPage() {
    const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);

    return (
        <div>
            <DefaultCustomIndex />
            <IndexesTable data={[...topIndexes, ...customIndexes]} assets={assets} />
        </div>
    );
}
