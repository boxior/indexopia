"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import {DefaultCustomIndex} from "@/app/indexes/components/DefaultCustomIndex";
import * as React from "react";

export default async function IndexesPage() {
    const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    const customIndexes = await getCustomIndexes();
    const assets = await getCachedTopAssets();

    return (
        <div>
            <DefaultCustomIndex />
            <IndexesTable data={[...topIndexes, ...customIndexes]} assets={assets} />
        </div>
    );
}
