import {handleGenerateSystemIndexOverviewAssetsWithStartEndTimes} from "@/utils/heleprs/generators/handleGenerateSystemIndexFromScratch.helper";
import {dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {getAssetsWithHistories, getIndexHistory, getHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {
    Asset,
    AssetHistory,
    IndexOverview,
    IndexOverviewAsset,
    SaveSystemIndexProps,
} from "@/utils/types/general.types";
import {pick} from "lodash";
import {getSystemIndexOverviewId} from "@/utils/heleprs/index/index.helpers";
import {DEFAULT_INDEX_STARTING_BALANCE} from "@/utils/constants/general.constants";

export const handleSaveSystemIndexOverview = async (props: SaveSystemIndexProps) => {
    return await dbPostIndexOverview(await handlePrepareToSaveSystemIndexOverview(props));
};

export const handlePrepareToSaveSystemIndexOverview = async (
    props: SaveSystemIndexProps,
    propAssets?: Asset[],
    normalizedAssetsHistory?: Record<string, AssetHistory[]>
): Promise<Omit<IndexOverview, "id">> => {
    const {name: propName} = props;

    const {
        assets,
        startTime: assetsStartTime,
        endTime: assetsEndTime,
    } = await handleGenerateSystemIndexOverviewAssetsWithStartEndTimes(props, propAssets, normalizedAssetsHistory);

    const {
        assets: assetsWithHistories,
        startTime,
        endTime,
    } = await getAssetsWithHistories<IndexOverviewAsset>({
        assets,
        startTime: assetsStartTime,
        endTime: assetsEndTime,
        normalizedAssetsHistory,
    });

    const systemId = getSystemIndexOverviewId({
        systemIndexSortBy: props.systemIndexSortBy,
        systemIndexBy: props.systemIndexBy,
        assetsCount: props.upToNumber ?? props.topAssetsCount,
    });
    const name = propName ?? `System Index ${generateUuid()}`;
    const startingBalance = DEFAULT_INDEX_STARTING_BALANCE;

    const indexHistory = getIndexHistory({
        id: systemId,
        name,
        assets: assetsWithHistories,
        startingBalance,
    });
    const historyOverview = getHistoryOverview(indexHistory);
    const maxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        name,
        startingBalance,
        assets: assets.map(asset => pick(asset, ["id", "name", "rank", "symbol", "portion"])),
        startTime: startTime ?? performance.now(),
        endTime: endTime ?? performance.now(),
        systemId,
        historyOverview,
        maxDrawDown,
    };
};
