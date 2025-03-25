import {
    AssetWithHistory,
    AssetWithProfitAndMaxDrawDown,
    CustomIndexAsset,
    DefaultIndexBy,
    DefaultIndexSortBy,
} from "@/utils/types/general.types";
import {getIndexAssetsWithPortionsByRankAndProfit} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndProfit.helper";
import {getIndexAssetsWithPortionsByRank} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRank.helper";
import {sortMostProfitableAssets} from "@/utils/heleprs/generators/profit/sortMostProfitableIndexAssets.helper";
import {sortLessMaxDrawDownIndexAssets} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {getIndexAssetsWithPortionsByRankAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndMaxDrawDown.helper";
import {getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown.helper";

export function handleGenerateDefaultIndex(props: {
    assets: AssetWithHistory[];
    upToNumber: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
}): CustomIndexAsset[] {
    const {defaultIndexBy = DefaultIndexBy.RANK, defaultIndexSortBy = DefaultIndexSortBy.PROFIT, upToNumber} = props;

    return (() => {
        switch (defaultIndexSortBy) {
            case DefaultIndexSortBy.PROFIT:
                const mostProfitableAssets = sortMostProfitableAssets(props).slice(0, upToNumber);

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(mostProfitableAssets);
                    case DefaultIndexBy.RANK_AND_EXTRA:
                        return getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);
                    default:
                        return [];
                }
            case DefaultIndexSortBy.MAX_DRAW_DOWN:
                const lessMaxDrawDownAssets = sortLessMaxDrawDownIndexAssets(props).slice(0, upToNumber);

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(lessMaxDrawDownAssets);
                    case DefaultIndexBy.RANK_AND_EXTRA:
                        return getIndexAssetsWithPortionsByRankAndMaxDrawDown(lessMaxDrawDownAssets);
                    default:
                        return [];
                }
            case DefaultIndexSortBy.OPTIMAL:
                const optimalAssets = sortLessMaxDrawDownIndexAssets({
                    ...props,
                    assets: sortMostProfitableAssets(props),
                }).slice(0, props.upToNumber) as unknown as AssetWithProfitAndMaxDrawDown[];

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(optimalAssets);
                    case DefaultIndexBy.RANK_AND_EXTRA:
                        return getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown(optimalAssets);
                    default:
                        return [];
                }
            default:
                return [];
        }
    })();
}
