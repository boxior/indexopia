import {AssetWithProfitAndMaxDrawDown, CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Calculate portions of assets based on their rank, profit, and maxDrawDown.
 * Higher profit, lower rank, and lower maxDrawDown contribute to a larger portion.
 * Ensures that no portion is zero and portions are distributed proportionally.
 * Guarantees that the total portion equals 100%.
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
        const maxDrawDownValue = asset.maxDrawDown.value / 100; // Lower values should have more weight
        // Combine the weight factors: higher profit, lower rank, and lower maxDrawDown
        return sum + (1 / rank) * profit + 1 / maxDrawDownValue;
    }, 0);

    // Ensure no portion is zero
    const minPortion = 1; // Minimum percentage portion for each asset
    const totalMinPortion = minPortion * sortedAssets.length;
    let remainingPortion = 100 - totalMinPortion;

    // Calculate initial portions with rounding and ensure the total sums to 100
    let calculatedPortions: number[] = sortedAssets.map(asset => {
        const rank = parseInt(asset.rank, 10);
        const profit = asset.profit / 100;
        const maxDrawDownValue = asset.maxDrawDown.value / 100;
        // Calculate the weight for each asset
        const weight = (1 / rank) * profit + 1 / maxDrawDownValue;
        // Distribute proportional portion and round it
        return Math.round((weight / totalWeight) * remainingPortion) + minPortion;
    });

    // Adjust any rounding errors to ensure the sum of portions is exactly 100
    const totalCalculatedPortions = calculatedPortions.reduce((sum, portion) => sum + portion, 0);
    const adjustment = 100 - totalCalculatedPortions;

    // Apply adjustment to one of the assets to balance the total to 100
    calculatedPortions[calculatedPortions.length - 1] += adjustment;

    // Return assets with their calculated portions
    return sortedAssets.map((asset, index) => ({
        ...asset,
        portion: calculatedPortions[index],
    }));
}
