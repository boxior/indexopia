"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import {fetchAllAssetsAndHistory, getCustomIndexes} from "@/lib/db/helpers/db.helpers";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {connection} from "next/server";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    await connection();

    const {allAssets} = await fetchAllAssetsAndHistory();

    const customIndexes = await getCustomIndexes();

    return <IndexesTable data={customIndexes} assets={allAssets} />;
};
