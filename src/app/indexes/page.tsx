"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbGetIndexesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <IndexesPageComponent />
        </SuspenseContainer>
    );
}

const IndexesPageComponent = async () => {
    await connection();

    const indexesOverview = await dbGetIndexesOverview();

    return <IndexesTable data={indexesOverview} />;
};
