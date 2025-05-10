import {IndexId, ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssetsTable} from "@/app/indexes/[id]/components/IndexAssetsTable";
import {getCachedTopAssets, getCustomIndex, getIndex} from "@/lib/db/helpers/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";
import {getIsTopIndex} from "@/app/indexes/helpers";
import * as React from "react";
import {CustomIndex} from "@/app/indexes/components/CustomIndex/CustomIndex";
import {handleQueryCustomIndexById} from "@/lib/db/helpers/db.customIndex.helpers";

export default async function IndexPage(props: ServerPageProps<IndexId | string>) {
    const params = await props.params;
    const assets = await getCachedTopAssets();
    const customIndex = await handleQueryCustomIndexById(params.id);
    const doEdit = customIndex && !customIndex?.isDefault;

    const index = await (async () => {
        switch (true) {
            case getIsTopIndex(params.id):
                return await getIndex({id: params.id as IndexId});
            default: {
                return await getCustomIndex({
                    id: params.id,
                });
            }
        }
    })();

    if (!index) {
        return <div>Custom index not found</div>;
    }

    return (
        <div className={"flex flex-col gap-4"}>
            {doEdit && <CustomIndex assets={assets} customIndex={customIndex} />}
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
}
