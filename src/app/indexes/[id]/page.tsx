import {AssetWithHistory, Index, IndexId, ServerPageProps} from "@/utils/types/general.types";
import {IndexChart} from "@/app/indexes/[id]/components/IndexChart";
import {IndexAssets} from "@/app/indexes/[id]/components/IndexAssets";
import {getIndex} from "@/app/api/assets/db.helpers";
import {Card} from "@/components/ui/card";
import {IndexOverview} from "@/app/indexes/[id]/components/IndexOverview";

export default async function IndexPage(props: ServerPageProps<IndexId>) {
    const params = await props.params;
    const index = (await getIndex(params.id, true)) as Index<AssetWithHistory>;

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
