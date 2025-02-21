import {readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import getAssets from "@/app/api/assets/getAssets";
import moment from "moment/moment";
import getAssetHistory from "@/app/api/assets/getAssetHistory";
import {DbItems} from "@/app/api/assets/db.types";
import {Asset, AssetHistory, NormalizedAssetHistory, NormalizedAssets} from "@/utils/types/general.types";

const ASSETS_FOLDER_PATH = "/db/assets";
const ASSETS_HISTORY_FOLDER_PATH = "/db/assets_history";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleGetAllAssets = async () => {
    const fileName = "assets";

    const prevData = await readJsonFile(fileName, {}, ASSETS_FOLDER_PATH);
    const prevList = (prevData as any)?.data ?? [];

    const nextData = await getAssets({limit: 2000, offset: prevList.length});
    const nextList = (nextData as any).data ?? [];

    if (nextList.length === 0) {
        return;
    }

    await writeJsonFile(fileName, {data: [...prevList, ...nextList]}, ASSETS_FOLDER_PATH);

    return await handleGetAllAssets();
};

const handleGetAssetHistory = async ({id}: {id: string}) => {
    const fileName = `asset_${id}_history`;
    const oldData = await readJsonFile(fileName, {}, ASSETS_HISTORY_FOLDER_PATH);
    const oldList = (oldData as any)?.data ?? [];

    if (oldList.length > 0) {
        return;
    }

    const start = moment().add(-11, "year").add(1, "minute").valueOf();
    const end = moment().valueOf();

    const newData = await getAssetHistory({
        id,
        params: {interval: "d1", start, end},
    });

    const newList = (newData as any).data ?? [];

    if (newList.length === 0) {
        return;
    }

    await writeJsonFile(fileName, {data: newList}, ASSETS_HISTORY_FOLDER_PATH);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleGetAllAssetsHistories = async () => {
    const assets = await readJsonFile("assets", {}, ASSETS_FOLDER_PATH);
    const assetsList = (assets as any)?.data ?? [];

    for (const asset of assetsList) {
        try {
            await handleGetAssetHistory({id: asset.id});
        } catch (err) {
            await writeJsonFile(`error_${(err as Error).name}`, JSON.parse(JSON.stringify(err)), `/db/errors`);
        }
    }
};

export const normalizeAssets = async (): Promise<NormalizedAssets> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = assets?.data ?? [];

    const normalizedAssets: NormalizedAssets = {};

    for (const asset of assetsList) {
        if (asset.id) {
            normalizedAssets[asset.id] = asset;
        }
    }

    return normalizedAssets;
};

export const normalizeAssetsHistory = async (): Promise<NormalizedAssetHistory> => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = assets?.data ?? [];

    const normalizedAssetHistory: NormalizedAssetHistory = {};

    for (const asset of assetsList) {
        if (asset.id) {
            const history = (await readJsonFile(
                `asset_${asset.id}_history`,
                {},
                ASSETS_HISTORY_FOLDER_PATH
            )) as DbItems<AssetHistory>;
            const historyList = history?.data ?? [];

            normalizedAssetHistory[asset.id] = historyList;
        }
    }

    return normalizedAssetHistory;
};
