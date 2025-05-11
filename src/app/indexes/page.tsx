"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    // console.time("topIndexes");
    const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    // console.timeEnd("topIndexes");
    // console.time("customIndexes");

    const customIndexes = await getCustomIndexes();
    // console.timeEnd("customIndexes");
    // console.time("assets");

    const assets = await getCachedTopAssets();

    // console.timeEnd("assets");

    return <IndexesTable data={[...topIndexes, ...customIndexes]} assets={assets} />;
};
