import {Asset, IndexOverviewAsset} from "@/utils/types/general.types";
import {pick} from "lodash";

export const getIndexOverviewAsset = <A extends IndexOverviewAsset = Asset & {portion: number}>(
    asset: A
): IndexOverviewAsset => {
    return pick(asset, ["id", "name", "symbol", "rank", "portion"]);
};
