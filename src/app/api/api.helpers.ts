import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {dbGetAssets, dbGetAssetsByIds, dbPostAssets} from "@/lib/db/helpers/db.assets.helpers";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {AssetHistory} from "@/utils/types/general.types";
import {dbGetAssetHistoryById, dbPostAssetHistory} from "@/lib/db/helpers/db.assetsHistory.helpers";
import momentTimeZone from "moment-timezone";
import fetchAssetHistory from "@/app/actions/assets/fetchAssetHistory";
import {ASSETS_FOLDER_PATH, filterAssetsByOmitIds} from "@/lib/db/helpers/db.helpers";
import {chunk, flatten} from "lodash";
import {dbGetUniqueCustomIndexesAssetIds} from "@/lib/db/helpers/db.indexOverview.helpers";

export const manageAssets = async () => {
    const limit = MAX_ASSET_COUNT + OMIT_ASSETS_IDS.length;

    const {data, timestamp} = await fetchAssets({limit});
    const assets = filterAssetsByOmitIds(data);

    const customIndexesAssetsIds = await dbGetUniqueCustomIndexesAssetIds();
    const assetsIdsToFetchMore = customIndexesAssetsIds.filter(id => !assets.some(asset => asset.id === id));
    const assetsToFetchMore = await dbGetAssetsByIds(assetsIdsToFetchMore);

    const allAssets = [...assets, ...assetsToFetchMore];

    await dbPostAssets(allAssets);
    await writeJsonFile(`assets_fetch_${new Date(timestamp).toISOString()}`, allAssets, ASSETS_FOLDER_PATH);

    return allAssets;
};
export const manageAssetHistory = async ({id}: {id: string}): Promise<AssetHistory[]> => {
    const oldList = await dbGetAssetHistoryById(id);

    let start = momentTimeZone.tz("UTC").startOf("day").add(-11, "year").add(1, "day").valueOf();

    if (oldList.length > 0) {
        start = momentTimeZone
            .tz(oldList[oldList.length - 1].time, "UTC")
            .startOf("day")
            .add(1, "day")
            .valueOf();
    }

    const end = momentTimeZone.tz("UTC").startOf("day").valueOf();

    if (start === end) {
        return oldList;
    }

    const {data: newData} = await fetchAssetHistory({
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

export const manageAssetsHistory = async (): Promise<AssetHistory[]> => {
    const assets = await dbGetAssets();

    const chunks = chunk(assets, 10);

    const result = await Promise.all(
        chunks.map(async chunk => {
            return Promise.all(
                chunk.map(async asset => {
                    try {
                        return manageAssetHistory({id: asset.id});
                    } catch (err) {
                        console.error(err);
                        await writeJsonFile(
                            `error_${(err as Error).name}`,
                            JSON.parse(JSON.stringify(err)),
                            `/db/errors`
                        );

                        return [];
                    }
                })
            );
        })
    );

    return flatten(flatten(result));
};
