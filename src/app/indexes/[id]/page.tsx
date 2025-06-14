import {ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssetsTable} from "@/app/indexes/[id]/components/IndexAssetsTable";
import {getCachedTopAssets, getCustomIndex} from "@/lib/db/helpers/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";
import * as React from "react";
import {dbHandleQueryCustomIndexById} from "@/lib/db/helpers/db.customIndex.helpers";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {UpdateCustomIndex} from "@/app/indexes/components/CustomIndex/UpdateCustomIndex";

export default async function IndexPage(props: ServerPageProps) {
    return (
        <SuspenseContainer>
            <SuspendedComponent {...props} />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async (props: ServerPageProps) => {
    const params = await props.params;
    const assets = await getCachedTopAssets();

    const customIndex = await dbHandleQueryCustomIndexById(params.id);

    const index = await getCustomIndex({
        id: params.id,
    });

    if (!index) {
        return <div>Custom index not found</div>;
    }

    const doUpdate = customIndex && !customIndex.isSystem;

    return (
        <div className={"flex flex-col gap-4"}>
            {doUpdate && <UpdateCustomIndex assets={assets} customIndex={customIndex} />}
            <div className="flex gap-4">
                <Card className={"flex-1 p-2"}>
                    <IndexOverview index={index} />
                </Card>
                <Card className="size-2/4 ">
                    <IndexChart index={index} />
                </Card>
            </div>

            <IndexAssetsTable index={index} />
        </div>
    );
};
