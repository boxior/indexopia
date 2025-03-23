import {Asset, DefaultIndexBy} from "@/utils/types/general.types";
import {getMostProfitableAssets} from "@/utils/heleprs/generators/getMostProfitableIndexAssets.helper";
import {getIndexAssetsWithPortionsByRankAndProfit} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRankAndProfit.helper";
import {getIndexAssetsWithPortionsByRank} from "@/utils/heleprs/generators/getIndexAssetsWithPortionsByRank.helper";

export function handleGenerateDefaultIndex(props: {
    assets: Asset[];
    upToNumber: number;
    defaultIndexBy?: DefaultIndexBy;
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}) {
    const {defaultIndexBy = DefaultIndexBy.RANK} = props;
    const mostProfitableAssets = getMostProfitableAssets(props);

    switch (defaultIndexBy) {
        case DefaultIndexBy.RANK:
            return getIndexAssetsWithPortionsByRank(mostProfitableAssets);
        case DefaultIndexBy.RANK_AND_PROFIT:
            return getIndexAssetsWithPortionsByRankAndProfit(mostProfitableAssets);
        default:
            return [];
    }
}
