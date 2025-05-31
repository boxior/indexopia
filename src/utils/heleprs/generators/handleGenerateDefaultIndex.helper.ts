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
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";
import {getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown.helper";
import {pick} from "lodash";
import {getIndexAssetsWithPortionsByRankAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndMaxDrawDown.helper";

export function handleGenerateDefaultIndex(props: {
    assets: AssetWithHistory[];
    upToNumber: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    equalPortions?: boolean;
}): CustomIndexAsset[] {
    const {
        defaultIndexBy = DefaultIndexBy.RANK,
        defaultIndexSortBy = DefaultIndexSortBy.PROFIT,
        upToNumber,
        equalPortions = false,
    } = props;
    const sortedAssetsByRank = sortRankIndexAssets(props.assets);

    if (equalPortions) {
        const assets = sortedAssetsByRank.slice(0, upToNumber);
        return assets.map(a => ({...pick(a, "id"), portion: Math.trunc(100 / assets.length)}));
    }

    return (() => {
        switch (defaultIndexSortBy) {
            case DefaultIndexSortBy.PROFIT:
                const mostProfitableAssets = sortMostProfitableAssets({assets: sortedAssetsByRank}).slice(
                    0,
                    upToNumber
                );

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(mostProfitableAssets);
                    case DefaultIndexBy.EXTRA:
                        return getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);
                    default:
                        return [];
                }
            case DefaultIndexSortBy.MAX_DRAW_DOWN:
                const lessMaxDrawDownAssets = sortLessMaxDrawDownIndexAssets({assets: sortedAssetsByRank}).slice(
                    0,
                    upToNumber
                );

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(lessMaxDrawDownAssets);
                    case DefaultIndexBy.EXTRA:
                        return getIndexAssetsWithPortionsByRankAndMaxDrawDown(lessMaxDrawDownAssets);
                    default:
                        return [];
                }
            case DefaultIndexSortBy.OPTIMAL:
                const optimalAssets = sortLessMaxDrawDownIndexAssets({
                    assets: sortMostProfitableAssets({assets: sortedAssetsByRank}),
                }).slice(0, upToNumber) as unknown as AssetWithProfitAndMaxDrawDown[];

                switch (defaultIndexBy) {
                    case DefaultIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(optimalAssets);
                    case DefaultIndexBy.EXTRA:
                        const mostProfitableAssets = sortMostProfitableAssets({assets: sortedAssetsByRank}).slice(
                            0,
                            upToNumber
                        );

                        const assetsByProfit = getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);

                        const lessMaxDrawDownAssets = sortLessMaxDrawDownIndexAssets({
                            assets: sortedAssetsByRank,
                        }).slice(0, upToNumber);

                        const assetsByMaxDrawDown =
                            getIndexAssetsWithPortionsByRankAndMaxDrawDown(lessMaxDrawDownAssets);

                        return getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown(
                            assetsByProfit,
                            assetsByMaxDrawDown
                        );
                    default:
                        return [];
                }
            default:
                return [];
        }
    })();
}
