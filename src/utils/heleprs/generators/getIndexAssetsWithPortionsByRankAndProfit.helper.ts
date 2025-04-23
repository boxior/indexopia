import {AssetWithProfit, CustomIndexAsset} from "@/utils/types/general.types";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): CustomIndexAsset[] {
    if (assets.length === 0) {
        return [];
    }

    // Extract profits from the list and find the minimum (most negative) and maximum profit
    const profits = assets.map(asset => asset.profit);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);

    // Guard against all profits being the same (avoid division by zero)
    const profitRange = maxProfit - minProfit;
    if (profitRange === 0) {
        // If all profits are the same, assign equal portions
        const equalPortion = 100 / assets.length;
        return assets.map(asset => ({
            ...asset,
            portion: Math.round(equalPortion),
        }));
    }

    // Define the maximum portion for the most positive profit
    const maxPortion = 50; // N = 50% for the maximum profit as per requirements

    // Calculate the portions
    const rawPortions = assets.map(asset => {
        const {profit} = asset;

        // Scale the profit relative to the range, ensuring the most negative profit corresponds to 1%
        const relativeProfit = (profit - minProfit) / profitRange; // Normalized profit between [0, 1]
        const portion = 1 + relativeProfit * (maxPortion - 1); // Scale to [1%, maxPortion%]

        return portion;
    });

    // Calculate the total sum of raw portions
    const totalRawPortions = rawPortions.reduce((sum, portion) => sum + portion, 0);

    // Normalize portions to ensure they sum to exactly 100%
    const normalizedPortions = rawPortions.map(portion => (portion / totalRawPortions) * 100);

    // Round portions to integers, ensuring the total is exactly 100%
    let roundedPortions = normalizedPortions.map(portion => Math.round(portion));
    let totalRounded = roundedPortions.reduce((sum, portion) => sum + portion, 0);

    // Fix any rounding discrepancies — adjust the largest portion up or down
    if (totalRounded !== 100) {
        const difference = 100 - totalRounded;
        const indexToAdjust =
            difference > 0
                ? roundedPortions.indexOf(Math.max(...roundedPortions))
                : roundedPortions.indexOf(Math.min(...roundedPortions));
        roundedPortions[indexToAdjust] += difference;
    }

    // Return the assets with their final portions
    return assets.map((asset, index) => ({
        ...asset,
        portion: roundedPortions[index],
    }));
}
