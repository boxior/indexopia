import {AssetWithProfit, CustomIndexAsset} from "@/utils/types/general.types";
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): CustomIndexAsset[] {
    // Parse ranks and sort assets by their rank (ascending order)
    const sortedAssets = sortRankIndexAssets<AssetWithProfit>(assets);

    // Get the minimum profit for normalization
    const minProfit = Math.min(...sortedAssets.map(asset => asset.profit));

    // Adjust profits to ensure they are all >= 1 (normalize profits)
    const adjustedAssets = sortedAssets.map(asset => ({
        ...asset,
        adjustedProfit: asset.profit - minProfit + 1, // Shift profits so the smallest becomes 1
    }));

    // Calculate the total "weight" for distributing portions
    const totalWeight = adjustedAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const adjustedProfit = asset.adjustedProfit;
        return sum + (1 / rank) * adjustedProfit;
    }, 0);

    // Assign raw portions based on the calculated weights
    let rawPortions = adjustedAssets.map(asset => {
        const rank = parseInt(asset.rank, 10);
        const adjustedProfit = asset.adjustedProfit;
        const weight = (1 / rank) * adjustedProfit;
        return (weight / totalWeight) * 100; // Portion as a percentage
    });

    // Ensure each portion is at least 1% and calculate total
    rawPortions = rawPortions.map(portion => Math.max(portion, 1)); // Enforce minimum portion of 1%
    const totalAllocated = rawPortions.reduce((sum, portion) => sum + portion, 0);

    // Adjust portions if total exceeds or is less than exactly 100%
    const adjustment = 100 - totalAllocated;

    if (adjustment !== 0) {
        // Redistribute the adjustment proportionally
        rawPortions = rawPortions.map(portion => portion + (portion / totalAllocated) * adjustment);
    }

    // Round portions and finalize
    let finalPortions = rawPortions.map(portion => Math.round(portion));

    // Handle rounding edge case so the sum is exactly 100%
    const finalTotal = finalPortions.reduce((sum, portion) => sum + portion, 0);
    const roundingError = 100 - finalTotal;

    if (roundingError !== 0) {
        // Fix the difference by adjusting the largest/smallest portion
        const indexToAdjust =
            roundingError > 0
                ? finalPortions.findIndex(portion => portion > 1) // Find a portion to increment
                : finalPortions.findIndex(portion => portion > Math.abs(roundingError)); // Find a portion to decrement

        finalPortions[indexToAdjust] += roundingError;
    }

    // Return the assets with their respective portions
    return adjustedAssets.map((asset, index) => ({
        ...asset,
        portion: finalPortions[index],
    }));
}
