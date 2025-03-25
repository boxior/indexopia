import {AssetWithProfitAndMaxDrawDown, CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Calculate portions of assets based on their rank, profit, and maxDrawDown.
 * Higher profit, lower rank, and lower maxDrawDown contribute to a larger portion.
 * Ensures that no portion is zero and portions are distributed proportionally.
 */
export function getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown(
    assets: AssetWithProfitAndMaxDrawDown[]
): CustomIndexAsset[] {
    // Parse ranks and sort assets by their rank (ascending order)
    const sortedAssets = assets.toSorted((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10));

    // Calculate the total "weight" based on rank, profit, and maxDrawDown
    const totalWeight = sortedAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const profit = asset.profit / 100; // Normalize profit
        const maxDrawDownValue = asset.maxDrawDown.value; // Lower values should have more weight

        // Combine the weight factors: higher profit, lower rank, and lower maxDrawDown
        return sum + (1 / rank) * profit * (1 / maxDrawDownValue);
    }, 0);

    // Ensure minimum portion per asset to avoid zero portions
    const minPortion = 1; // Minimum percentage portion for each asset
    const totalMinPortion = minPortion * sortedAssets.length;
    let remainingPortion = 100 - totalMinPortion;

    return sortedAssets.map((asset, index) => {
        const rank = parseInt(asset.rank, 10);
        const profit = asset.profit / 100;
        const maxDrawDownValue = asset.maxDrawDown.value;

        // Calculate the weight for each asset
        const weight = (1 / rank) * profit * (1 / maxDrawDownValue);

        // Calculate the proportional portion for each asset
        let portion = Math.round((weight / totalWeight) * remainingPortion) + minPortion;

        // Ensure the last asset accounts for any rounding errors by assigning the remaining portion
        if (index === sortedAssets.length - 1) {
            portion = remainingPortion + totalMinPortion; // Add all remaining portions, including the minimum
        }

        // Update the remaining portion for future iterations
        remainingPortion -= Math.max(0, portion - minPortion);

        return {...asset, portion};
    });
}
