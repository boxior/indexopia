import {CustomIndexType, IndexId, ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssetsTable} from "@/app/indexes/[id]/components/IndexAssetsTable";
import {getCachedTopAssets, getCustomIndex, getIndex, INDEXES_FOLDER_PATH} from "@/app/db/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";
import {getIsTopIndex} from "@/app/indexes/helpers";
import {readJsonFile} from "@/utils/heleprs/fs.helpers";
import * as React from "react";
import {CustomIndex} from "@/app/indexes/components/CustomIndex/CustomIndex";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";

export default async function IndexPage(props: ServerPageProps<IndexId>) {
    const params = await props.params;
    const assets = await getCachedTopAssets(MAX_ASSET_COUNT);
    const customIndex = (await readJsonFile(`${params.id}`, null, INDEXES_FOLDER_PATH)) as CustomIndexType | undefined;
    const doEdit = customIndex && !customIndex?.isDefault;

    const index = await (async () => {
        switch (true) {
            case getIsTopIndex(params.id):
                return await getIndex({id: params.id});
            default: {
                const customIndex = (await readJsonFile(`${params.id}`, {}, INDEXES_FOLDER_PATH)) as CustomIndexType;

                return await getCustomIndex({
                    id: customIndex.id,
                });
            }
        }
    })();

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
