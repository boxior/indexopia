import {
    AssetWithHistory,
    AssetWithProfitAndMaxDrawDown,
    IndexOverviewAsset,
    SystemIndexBy,
    SystemIndexSortBy,
} from "@/utils/types/general.types";
import {getIndexAssetsWithPortionsByRankAndProfit} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndProfit.helper";
import {getIndexAssetsWithPortionsByRank} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRank.helper";
import {sortMostProfitableAssets} from "@/utils/heleprs/generators/profit/sortMostProfitableIndexAssets.helper";
import {sortLessMaxDrawDownIndexAssets} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";
import {getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown.helper";
import {pick} from "lodash";
import {getIndexAssetsWithPortionsByRankAndMaxDrawDown} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndMaxDrawDown.helper";

export function handleGenerateSystemIndexOverviewAssets(props: {
    assets: AssetWithHistory[];
    upToNumber: number;
    systemIndexBy?: SystemIndexBy;
    systemIndexSortBy?: SystemIndexSortBy;
    equalPortions?: boolean;
}): IndexOverviewAsset[] {
    const {
        systemIndexBy = SystemIndexBy.RANK,
        systemIndexSortBy = SystemIndexSortBy.PROFIT,
        upToNumber,
        equalPortions = false,
    } = props;
    const sortedAssetsByRank = sortRankIndexAssets(props.assets);

    if (equalPortions) {
        const assets = sortedAssetsByRank.slice(0, upToNumber);
        return assets.map(a => ({
            ...pick(a, ["id", "symbol", "name", "rank"]),
            portion: Math.trunc(100 / assets.length),
        }));
    }

    return (() => {
        switch (systemIndexSortBy) {
            case SystemIndexSortBy.PROFIT:
                const mostProfitableAssets = sortMostProfitableAssets({assets: sortedAssetsByRank}).slice(
                    0,
                    upToNumber
                );

                switch (systemIndexBy) {
                    case SystemIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(mostProfitableAssets);
                    case SystemIndexBy.EXTRA:
                        return getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);
                    default:
                        return [];
                }
            case SystemIndexSortBy.MAX_DRAW_DOWN:
                const lessMaxDrawDownAssets = sortLessMaxDrawDownIndexAssets({assets: sortedAssetsByRank}).slice(
                    0,
                    upToNumber
                );

                switch (systemIndexBy) {
                    case SystemIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(lessMaxDrawDownAssets);
                    case SystemIndexBy.EXTRA:
                        return getIndexAssetsWithPortionsByRankAndMaxDrawDown(lessMaxDrawDownAssets);

                    default:
                        return [];
                }
            case SystemIndexSortBy.OPTIMAL:
                const optimalAssets = sortLessMaxDrawDownIndexAssets({
                    assets: sortMostProfitableAssets({assets: sortedAssetsByRank}),
                }).slice(0, upToNumber) as unknown as AssetWithProfitAndMaxDrawDown[];

                switch (systemIndexBy) {
                    case SystemIndexBy.RANK:
                        return getIndexAssetsWithPortionsByRank(optimalAssets);
                    case SystemIndexBy.EXTRA:
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
