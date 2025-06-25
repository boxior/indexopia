import {Asset, IndexOverviewAsset} from "@/utils/types/general.types";

/**
 * Helper function to assign a portion to each asset based on its rank.
 * The smallest rank gets the highest portion.
 * The sum of all portions for the provided assets equals 100.
 *
 * @param assets - Array of Assets with rank data.
 * @returns Array of Assets with the calculated portion.
 */
export function getIndexAssetsWithPortionsByRank(assets: Asset[]): IndexOverviewAsset[] {
    // Calculate the total "weight" based on rank for distributing the portions
    const totalWeight = assets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        return sum + 1 / rank; // Higher rank (lower number) gives bigger weight
    }, 0);

    // Assign portions proportionally based on the rank weight
    let remainingPortion = 100;
    return assets.map((asset, index) => {
        const rank = parseInt(asset.rank, 10);
        const weight = 1 / rank;
        const portion = Math.round((weight / totalWeight) * 100);

        // Ensure the last asset gets exactly the remaining portion to avoid rounding issues
        if (index === assets.length - 1) {
            return {...asset, portion: remainingPortion};
        }

        remainingPortion -= portion;
        return {...asset, portion};
    });
}
