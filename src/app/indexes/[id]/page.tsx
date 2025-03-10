import {AssetWithHistory, CustomIndex, Index, IndexId, ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssets} from "@/app/indexes/[id]/components/IndexAssets";
import {getCustomIndex, getIndex, INDEXES_FOLDER_PATH} from "@/app/api/assets/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";
import {getIsDefaultIndex} from "@/app/indexes/helpers";
import {readJsonFile} from "@/utils/heleprs/fs.helpers";

export default async function IndexPage(props: ServerPageProps<IndexId>) {
    const params = await props.params;

    const index = await (async () => {
        switch (true) {
            case getIsDefaultIndex(params.id):
                return (await getIndex(params.id, true)) as Index<AssetWithHistory>;
            default: {
                const customIndex = (await readJsonFile(`${params.id}`, {}, INDEXES_FOLDER_PATH)) as CustomIndex;

                return (await getCustomIndex({
                    id: customIndex.id,
                    withAssetHistory: true,
                })) as Index<AssetWithHistory>;
            }
        }
    })();

    return (
        <div className={"flex flex-col gap-4"}>
            <div className="flex gap-4">
                <Card className={"flex-1 p-2"}>
                    <IndexOverview index={index} />
                </Card>
                <Card className="size-2/4 ">
                    <IndexChart index={index} />
                </Card>
            </div>

            <IndexAssets index={index} />
        </div>
    );
}
