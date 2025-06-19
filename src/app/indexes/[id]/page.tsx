import {ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssetsTable} from "@/app/indexes/[id]/components/IndexAssetsTable";
import {getIndex} from "@/lib/db/helpers/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";
import * as React from "react";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {UpdateIndex} from "@/app/indexes/components/Index/UpdateIndex";
import {connection} from "next/server";

export default async function IndexPage(props: ServerPageProps) {
    return (
        <SuspenseContainer>
            <IndexPageComponent {...props} />
        </SuspenseContainer>
    );
}

const IndexPageComponent = async (props: ServerPageProps) => {
    await connection();

    const params = await props.params;

    const index = await getIndex({
        id: params.id,
    });

    if (!index) {
        return <div>Custom index not found</div>;
    }

    const doUpdate = index && !index.isSystem;

    return (
        <div className={"flex flex-col gap-4"}>
            {doUpdate && <UpdateIndex indexOverview={index} />}
            <div className="flex gap-4">
                <Card className={"flex-1 p-2"}>
                    <IndexOverview indexOverview={index} />
                </Card>
                <Card className="size-2/4 ">
                    <IndexChart index={index} />
                </Card>
            </div>

            <IndexAssetsTable index={index} />
        </div>
    );
};
