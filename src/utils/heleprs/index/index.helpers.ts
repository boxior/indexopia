import {handleGenerateDefaultIndexFromScratch} from "@/utils/heleprs/generators/handleGenerateDefaultIndexFromScratch.helper";
import {DbCreateIndex, dbCreateIndex} from "@/lib/db/helpers/db.index.helpers";
import {DbCreateIndexAsset, dbCreateIndexAssets} from "@/lib/db/helpers/db.indexAsset.helpers";
import {dbCreateIndexHistories, DbCreateIndexHistory} from "@/lib/db/helpers/db.indexHistory.helpers";
import {IndexId} from "@/utils/types/general.types";
import {getAssetsIdsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {pick} from "lodash";

export type HandleCreateIndexProps = {
    index: DbCreateIndex;
    assets: DbCreateIndexAsset[];
    histories: DbCreateIndexHistory[];
};
export const handleDbCreateIndex = async ({index, assets, histories}: HandleCreateIndexProps) => {
    await dbCreateIndex(index);

    await dbCreateIndexAssets({indexId: index.id, assets});

    await dbCreateIndexHistories({indexId: index.id, histories});
};

export const handlePrepareDbCreateIndex = async ({
    assetIds,
    id,
    name,
    isSystem,
}: HandlePrepareCreateIndexProps): Promise<HandleCreateIndexProps> => {
    let preparedAssets = [];

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsIdsWithHistories({
        assetIds,
    });

    preparedAssets = assetsWithHistories;

    preparedAssets = preparedAssets.map(asset => ({
        ...asset,
        portion: Math.trunc(100 / assetIds.length),
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const indexHistory = await getIndexHistory({assets: preparedAssets});
    const indexHistoryOverview = await getIndexHistoryOverview({assets: preparedAssets});
    const indexMaxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    const index: DbCreateIndex = {
        id,
        name,
        historyOverview: indexHistoryOverview,
        maxDrawDown: indexMaxDrawDown,
        startTime,
        endTime,
        isSystem,
    };

    const assets = preparedAssets.map(a => pick(a, ["id", "portion", "historyOverview", "maxDrawDown"]));

    return {
        index,
        assets,
        histories: indexHistory,
    };
};

export type HandlePrepareCreateIndexProps = {
    id: IndexId | string;
    name: string;
    assetIds: string[];
    isSystem?: boolean;
};

export const handleCreateIndex = async ({id, name, assetIds, isSystem}: HandlePrepareCreateIndexProps) => {
    const {index, assets, histories} = await handlePrepareDbCreateIndex({
        assetIds,
        id,
        name,
        isSystem,
    });

    await handleDbCreateIndex({index, assets, histories});
};
