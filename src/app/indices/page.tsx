"use server";

import IndicesTable from "@/app/indices/components/IndicesTable";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {connection} from "next/server";
import {MOCK_USER_ID} from "@/utils/constants/general.constants";

export default async function IndicesPage() {
    return (
        <SuspenseContainer>
            <IndicesPageComponent />
        </SuspenseContainer>
    );
}

const IndicesPageComponent = async () => {
    await connection();

    const systemIndicesOverview = await dbGetIndicesOverview();
    const userIndicesOverview = await dbGetIndicesOverview(MOCK_USER_ID);

    return <IndicesTable data={[...systemIndicesOverview, ...userIndicesOverview]} />;
};
