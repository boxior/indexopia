import {readJsonFile, writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {DbItems} from "@/lib/db/db.types";
import {Asset, RawAssetHistory} from "@/utils/types/general.types";
import {MAX_ASSETS_COUNT} from "@/utils/constants/general.constants";
import {dbPostAssetHistory} from "@/lib/db/helpers/db.assetsHistory.helpers";
import {ASSETS_FOLDER_PATH, ASSETS_HISTORY_FOLDER_PATH, filterAssetsByOmitIds} from "@/lib/db/helpers/db.helpers";

export const migrateAssetsHistoriesFromJsonToDb = async () => {
    const assets = (await readJsonFile("assets", {}, ASSETS_FOLDER_PATH)) as DbItems<Asset>;
    const assetsList = filterAssetsByOmitIds(assets?.data ?? [], MAX_ASSETS_COUNT);

    for (const asset of assetsList) {
        try {
            const assetHistory = (await readJsonFile(
                `asset_${asset.id}_history`,
                {},
                ASSETS_HISTORY_FOLDER_PATH
            )) as DbItems<RawAssetHistory>;
            const normalizedAssetHistory = assetHistory.data.map(history => ({assetId: asset.id, ...history}));

            await dbPostAssetHistory(normalizedAssetHistory);
        } catch (err) {
            console.error(err);
            await writeJsonFile(`error_${(err as Error).name}`, JSON.parse(JSON.stringify(err)), `/db/errors`);
        }
    }
};
