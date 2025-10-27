import {
    MAX_ASSETS_COUNT,
    MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES,
    OMIT_ASSETS_IDS,
} from "@/utils/constants/general.constants";
import {dbGetAssetsByIds, dbPostAssets} from "@/lib/db/helpers/db.assets.helpers";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {Asset, AssetHistory} from "@/utils/types/general.types";
import {
    dbDeleteAssetHistoryById,
    dbGetAssetHistoryById,
    dbPostAssetHistory,
} from "@/lib/db/helpers/db.assetsHistory.helpers";
import momentTimeZone from "moment-timezone";
import fetchAssetHistory from "@/app/actions/assets/fetchAssetHistory";
import {ASSETS_FOLDER_PATH, filterAssets} from "@/lib/db/helpers/db.helpers";
import {chunk, flatten} from "lodash";
import {dbGetUniqueIndicesOverviewsAssetIds, manageSystemIndices} from "@/lib/db/helpers/db.indexOverview.helpers";
import {NextResponse} from "next/server";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {actionGetAssets} from "@/app/[locale]/indices/[id]/actions";

export const manageAssets = async () => {
    const limit = MAX_ASSETS_COUNT + OMIT_ASSETS_IDS.length;

    const {data, timestamp} = await fetchAssets({limit});
    const assets = filterAssets(data);

    const indicesOverviewsAssetsIds = await dbGetUniqueIndicesOverviewsAssetIds();
    const assetsIdsToFetchMore = indicesOverviewsAssetsIds.filter(id => !assets.some(asset => asset.id === id));
    const assetsToFetchMore = await dbGetAssetsByIds(assetsIdsToFetchMore);

    const allAssets = [...assets, ...assetsToFetchMore];

    await dbPostAssets(allAssets);
    await writeJsonFile(`assets_fetch_${new Date(timestamp).toISOString()}`, allAssets, ASSETS_FOLDER_PATH);

    return allAssets;
};

export const manageAssetHistory = async ({
    id,
    fromScratch = false,
}: {
    id: string;
    fromScratch?: boolean;
}): Promise<AssetHistory[]> => {
    if (fromScratch) {
        await dbDeleteAssetHistoryById(id);
    }

    const oldList = fromScratch ? [] : await dbGetAssetHistoryById(id);

    let start = momentTimeZone.tz("UTC").startOf("day").add(-11, "year").add(1, "day").valueOf();

    if (oldList.length > 0) {
        start = momentTimeZone
            .tz(oldList[oldList.length - 1].time, "UTC")
            .startOf("day")
            .add(1, "day")
            .valueOf();
    }

    const end = momentTimeZone.tz("UTC").startOf("day").add(1, "day").valueOf();

    if (start === end) {
        return oldList;
    }

    const {data: newData} = await fetchAssetHistory({
        lastHistoryBefore: oldList.slice(-1)[0],
        interval: "d1",
        start,
        end,
        id,
    });

    const newList = (newData ?? []).map(history => ({...history, assetId: id}));

    if (newList.length === 0) {
        return oldList;
    }

    await writeJsonFile(`history_${id}`, newList, "/db/debug");
    await dbPostAssetHistory(newList);

    return [...oldList, ...newList];
};

export const manageAssetsHistory = async (propAssets?: Asset[], fromScratch?: boolean): Promise<AssetHistory[]> => {
    const assets = propAssets ?? (await actionGetAssets());

    const chunks = chunk(assets, 10);

    const result = [];

    for (const chunk of chunks) {
        const res = await Promise.all(
            chunk.map(async asset => {
                try {
                    return await manageAssetHistory({id: asset.id, fromScratch});
                } catch (err) {
                    console.error(err);
                    await writeJsonFile(`error_${(err as Error).name}`, JSON.parse(JSON.stringify(err)), `/db/errors`);

                    return [];
                }
            })
        );

        result.push(res);
    }

    // const result = await Promise.all(
    //     chunks.map(async chunk => {
    //         return await Promise.all(
    //             chunk.map(async asset => {
    //                 try {
    //                     return await manageAssetHistory({id: asset.id, fromScratch});
    //                 } catch (err) {
    //                     console.error(err);
    //                     await writeJsonFile(
    //                         `error_${(err as Error).name}`,
    //                         JSON.parse(JSON.stringify(err)),
    //                         `/db/errors`
    //                     );
    //
    //                     return [];
    //                 }
    //             })
    //         );
    //     })
    // );

    return flatten(flatten(result));
};

export type AssetCursor = {start: number; end?: number};

export const populateDb = async (assetCursor: AssetCursor) => {
    try {
        // Assets
        const allAssets = await manageAssets();

        const assetsToPopulate = allAssets.slice(assetCursor.start, assetCursor.end);

        // Assets history
        const allAssetsHistory = await manageAssetsHistory(assetsToPopulate);

        const doManageSystemIndices =
            assetCursor.start === 0 && (assetCursor.end ?? 0) >= MAX_ASSETS_COUNT_FOR_SYSTEM_INDICES;

        if (doManageSystemIndices) {
            await manageSystemIndices(assetsToPopulate, allAssetsHistory);
        }

        return NextResponse.json(
            {success: true},
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {data: JSON.parse(JSON.stringify(error))},
            {
                status: 400,
            }
        );
    }
};
