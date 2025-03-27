import {AssetWithMaxDrawDown, CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Calculate portions of assets based on their rank and maxDrawDown.
 * Lower maxDrawDown and higher rank contribute to a larger portion.
 */
export function getIndexAssetsWithPortionsByRankAndMaxDrawDown(assets: AssetWithMaxDrawDown[]): CustomIndexAsset[] {
    // Parse ranks and sort assets by their rank (ascending order)
    const sortedAssets = assets.toSorted((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10));

    // Calculate the total "weight" based on both rank and maxDrawDown for distributing the portions
    const totalWeight = sortedAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const maxDrawDown = asset.maxDrawDown.value; // Assume `maxDrawDown.value` is a positive numeric value
        return sum + (1 / rank) * (1 / maxDrawDown); // Lower maxDrawDown (and lower rank) gives a larger weight
    }, 0);

    // Assign portions proportionally based on the combined weight
    let remainingPortion = 100;

    return sortedAssets.map((asset, index) => {
        const rank = parseInt(asset.rank, 10);
        const maxDrawDown = asset.maxDrawDown.value;
        const weight = (1 / rank) * (1 / maxDrawDown); // Weight is inversely proportional to `maxDrawDown` value
        const portion = Math.round((weight / totalWeight) * 100);

        // Ensure that the last asset gets exactly the remaining portion to avoid rounding issues
        if (index === sortedAssets.length - 1) {
            return {...asset, portion: remainingPortion};
        }

        remainingPortion -= portion;
        return {...asset, portion};
    });
}
