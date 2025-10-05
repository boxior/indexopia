import {NextResponse, NextRequest} from "next/server";
import {
    AssetHistory,
    AssetWithHistoryAndOverview,
    IndexOverview,
    IndexOverviewAsset,
} from "@/utils/types/general.types";
import {chunk, flatten, pick, uniqBy} from "lodash";
import moment from "moment/moment";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {actionGetAssetHistory, actionGetAssetsWithHistory} from "@/app/[locale]/indices/actions";
import {getIndexHistory} from "@/utils/heleprs/index/index.helpers";

/**
 * Get all indices with history overview
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {indices = []} = body as {indices: IndexOverview[]}; // adjust the type as needed

        const allUsedAssets = indices
            .reduce((acc, index) => {
                return uniqBy([...acc, ...index.assets], "id");
            }, [] as IndexOverviewAsset[])
            .map(a => pick(a, ["id"]));

        const startTime = moment()
            .utc()
            .startOf("d")
            .add(-HISTORY_OVERVIEW_DAYS - 1, "days")
            .valueOf();

        const assetsChunks = chunk(
            allUsedAssets.map(a => ({id: a.id})),
            10
        );

        const normalizedAssetsHistory: Record<string, AssetHistory[]> = {};

        const assetsHistory = flatten(
            await Promise.all(
                assetsChunks.map(
                    async chunk => await Promise.all(chunk.map(ch => actionGetAssetHistory(ch.id, startTime)))
                )
            )
        );

        for (const [index, usedAsset] of allUsedAssets.entries()) {
            normalizedAssetsHistory[usedAsset.id] = assetsHistory[index] ?? [];
        }

        const fetchedIndicesWithHistory = await Promise.all(
            indices.map(async index => {
                const {assets: indexAssetsWithHistories} = await actionGetAssetsWithHistory({
                    assets: index.assets,
                    startTime,
                    normalizedAssetsHistory,
                });

                const history = getIndexHistory({
                    ...index,
                    assets: indexAssetsWithHistories as AssetWithHistoryAndOverview[],
                });

                return {
                    ...index,
                    history,
                };
            })
        );

        return NextResponse.json(
            {indices: fetchedIndicesWithHistory},
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {data: JSON.parse(JSON.stringify(error))},
            {
                status: 400,
            }
        );
    }
}
