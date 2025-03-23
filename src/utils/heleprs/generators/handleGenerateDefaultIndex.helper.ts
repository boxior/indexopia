import {Asset, DefaultIndexBy} from "@/utils/types/general.types";
import {getIndexAssetsWithPortionsByRankAndProfit} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndProfit.helper";
import {getIndexAssetsWithPortionsByRank} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRank.helper";
import {sortMostProfitableAssets} from "@/utils/heleprs/generators/profit/sortMostProfitableIndexAssets.helper";

export function handleGenerateDefaultIndex(props: {
    assets: Asset[];
    upToNumber: number;
    defaultIndexBy?: DefaultIndexBy;
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}) {
    const {defaultIndexBy = DefaultIndexBy.RANK} = props;
    const mostProfitableAssets = sortMostProfitableAssets(props).slice(0, props.upToNumber);

    switch (defaultIndexBy) {
        case DefaultIndexBy.RANK:
            return getIndexAssetsWithPortionsByRank(mostProfitableAssets);
        case DefaultIndexBy.RANK_AND_PROFIT:
            return getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);
        default:
            return [];
    }
}
