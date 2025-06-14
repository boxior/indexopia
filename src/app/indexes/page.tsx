"use server";

import IndexesTable from "@/app/indexes/components/IndexesTable";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbGetListIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";

export default async function IndexesPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    const customIndexes = await dbGetListIndexOverview();

    return <IndexesTable data={customIndexes} />;
};
