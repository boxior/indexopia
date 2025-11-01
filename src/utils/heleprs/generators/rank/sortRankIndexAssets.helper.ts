import {Asset} from "@/utils/types/general.types";

export function sortRankIndexAssets<A extends Asset>(assets: A[]): Array<A> {
    return assets.toSorted((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10));
}
