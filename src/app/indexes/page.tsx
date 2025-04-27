"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import {DefaultCustomIndex} from "@/app/indexes/components/DefaultCustomIndex";
import * as React from "react";
import {Suspense} from "react";

export default async function IndexesPage() {
    const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <IndexesTable data={[...topIndexes, ...customIndexes]} assets={assets} />
        </Suspense>
    );
}
