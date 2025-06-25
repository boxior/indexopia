import {Asset, IndexOverviewAsset, SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {pick} from "lodash";
import {MAX_ASSETS_COUNT} from "@/utils/constants/general.constants";

export const getIndexOverviewAsset = <A extends IndexOverviewAsset = Asset & {portion: number}>(
    asset: A
): IndexOverviewAsset => {
    return pick(asset, ["id", "name", "symbol", "rank", "portion"]);
};

export const getSystemIndexOverviewId = ({
    systemIndexBy = SystemIndexBy.RANK,
    systemIndexSortBy = SystemIndexSortBy.PROFIT,
    assetsCount = MAX_ASSETS_COUNT,
    equalPortions = false,
}: {
    systemIndexBy?: SystemIndexBy;
    systemIndexSortBy?: SystemIndexSortBy;
    assetsCount?: number;
    equalPortions?: boolean;
}) => {
    return equalPortions ? `equalPortions_${assetsCount}` : `${systemIndexSortBy}_${systemIndexBy}_${assetsCount}`;
};
