import {handleGenerateSystemIndexOverviewAssetsWithStartEndTimes} from "@/utils/heleprs/generators/handleGenerateSystemIndexFromScratch.helper";
import {SaveSystemIndexProps} from "@/utils/heleprs/generators/handleSaveSystemCustomIndex.helper";
import {dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {getAssetsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {IndexOverviewAsset} from "@/utils/types/general.types";

export const handleSaveSystemIndexOverview = async (props: SaveSystemIndexProps) => {
    const {name: propName} = props;
    //
    const {assets, startTime: assetsStartTime} = await handleGenerateSystemIndexOverviewAssetsWithStartEndTimes(props);

    const {assets: assetsWithHistories, startTime} = await getAssetsWithHistories<IndexOverviewAsset>({
        assets,
        startTime: assetsStartTime,
    });

    const name = propName ?? `System Index ${generateUuid()}`;

    const indexHistory = await getIndexHistory({id: "", name, assets: assetsWithHistories});
    const historyOverview = await getIndexHistoryOverview(assetsWithHistories);
    const maxDrawDown = getMaxDrawDownWithTimeRange(indexHistory);

    return dbPostIndexOverview({
        name,
        assets,
        startTime: startTime ?? performance.now(),
        isSystem: true,
        historyOverview,
        maxDrawDown,
    });
};
