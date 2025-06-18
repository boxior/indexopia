import {handleGenerateSystemIndexOverviewAssetsWithStartEndTimes} from "@/utils/heleprs/generators/handleGenerateSystemIndexFromScratch.helper";
import {SaveSystemIndexProps} from "@/utils/heleprs/generators/handleSaveSystemCustomIndex.helper";
import {dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {getAssetsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {Asset, AssetHistory, IndexOverview, IndexOverviewAsset} from "@/utils/types/general.types";
import {pick} from "lodash";

export const handleSaveSystemIndexOverview = async (props: SaveSystemIndexProps) => {
    return await dbPostIndexOverview(await handlePrepareToSaveSystemIndexOverview(props));
};

export const handlePrepareToSaveSystemIndexOverview = async (
    props: SaveSystemIndexProps,
    propAssets?: Asset[],
    normalizedAssetsHistory?: Record<string, AssetHistory[]>
): Promise<Omit<IndexOverview, "id">> => {
    const {name: propName} = props;
    //

    const {assets, startTime: assetsStartTime} = await handleGenerateSystemIndexOverviewAssetsWithStartEndTimes(
        props,
        propAssets,
        normalizedAssetsHistory
    );

    const {assets: assetsWithHistories, startTime} = await getAssetsWithHistories<IndexOverviewAsset>({
        assets,
        startTime: assetsStartTime,
        normalizedAssetsHistory,
    });

    const name = propName ?? `System Index ${generateUuid()}`;

    const indexHistory = await getIndexHistory({id: "", name, assets: assetsWithHistories});
    const historyOverview = await getIndexHistoryOverview(assetsWithHistories);
    const maxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return {
        name,
        assets: assets.map(asset => pick(asset, ["id", "name", "rank", "symbol", "portion"])),
        startTime: startTime ?? performance.now(),
        isSystem: true,
        historyOverview,
        maxDrawDown,
    };
};
