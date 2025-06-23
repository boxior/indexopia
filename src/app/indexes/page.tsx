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

    // TODO: Try to fetch as a list of indexes by id and cache it. So that, after Creating/Deleting/Updating a specific one revalidate only the suitable one.
    const systemIndexesOverview = await dbGetIndexesOverview();
    const indexesOverview = await dbGetIndexesOverview(false);

    return <IndexesTable data={[...systemIndexesOverview, ...indexesOverview]} />;
};
