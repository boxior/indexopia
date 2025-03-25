import {AssetWithHistory, AssetWithProfit} from "@/utils/types/general.types";

/**
 * Helper function to sort most profitable assets within a specific time range.
 * @param assets - Array of Assets with history data.
 * @returns Array of the most profitable Assets.
 */
export function sortMostProfitableAssets({
    assets,
}: {
    assets: AssetWithHistory[];
}): (AssetWithProfit & AssetWithHistory)[] {
    // Calculate the profit for each asset based on startTime and endTime
    const assetsWithProfit = assets
        .map(asset => {
            if (!asset.history || asset.history.length === 0) {
                return {...asset, profit: 0};
            }

            // Get the start and end prices within the period
            const startPrice = parseFloat(asset.history[0].priceUsd);
            const endPrice = parseFloat(asset.history[asset.history.length - 1].priceUsd);

            // Calculate profit as a percentage
            const profit = ((endPrice - startPrice) / startPrice) * 100;

            return {...asset, profit};
        })
        // Exclude assets with 0 profit
        .filter(asset => asset.profit !== 0);

    // Sort assets by profit in descending order
    return assetsWithProfit.toSorted((a, b) => b.profit - a.profit);
}
