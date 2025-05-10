"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {getCachedTopAssets, getCustomIndexes, getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexId} from "@/utils/types/general.types";
import * as React from "react";
import {dbGetIndexOverview} from "@/lib/db/helpers/db.index.helpers";

export default async function IndexesPage() {
    console.time("IndexesPage");
    console.time("topIndexes");
    // const topIndexes = await Promise.all(Object.values(IndexId).map(id => getIndex({id})));
    console.timeEnd("topIndexes");
    console.time("customIndexes");

    // const customIndexes = await getCustomIndexes();
    console.timeEnd("customIndexes");
    console.time("assets");

    // const assets = await getCachedTopAssets();
    console.timeEnd("assets");

    console.time("dbIndexes");
    const topIndex5 = await dbGetIndexOverview(IndexId.TOP_5);
    console.log("topIndex5", topIndex5);
    console.timeEnd("dbIndexes");
    console.timeEnd("IndexesPage");

    return <>Indexed Page</>;

    // return <IndexesTable data={[...topIndexes, ...customIndexes]} assets={assets} />;
}
