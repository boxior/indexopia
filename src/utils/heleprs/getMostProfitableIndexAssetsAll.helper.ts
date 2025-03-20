import {Asset, CustomIndexAsset} from "@/utils/types/general.types";

type AssetWithRevenue = Asset & {revenue: number};

/**
 * Helper function to calculate the most profitable index based on asset history.
 * @param assets - Array of Assets with history data.
 * @param upToAssetsInIndex - Maximum number of assets allowed in the Index.
 * @returns Array of Assets with their `portion` values set.
 */
export function getMostProfitableIndexAll(assets: Asset[], upToAssetsInIndex: number): CustomIndexAsset[] {
    // Step 1: Calculate revenue for each asset
    const assetsWithRevenue = assets.map(asset => {
        if (!asset.history || asset.history.length === 0) {
            return {...asset, revenue: 0}; // Add `revenue` property dynamically
        }

        const startPrice = parseFloat(asset.history[0].priceUsd);
        const endPrice = parseFloat(asset.history[asset.history.length - 1].priceUsd);

        const revenue = ((endPrice - startPrice) / startPrice) * 100; // Revenue in percentage
        return {...asset, revenue}; // Add `revenue`
    });

    // Step 2: Sort assets by revenue descending
    const sortedAssets = assetsWithRevenue.sort((a, b) => b.revenue - a.revenue);

    // Step 3: Optimize selection by finding the best subset that maximizes total revenue
    let maxTotalRevenue = -Infinity;
    let bestSubset: Asset[] = [];

    // Try different subset sizes (from 1 to upToAssetsInIndex)
    for (let i = 1; i <= upToAssetsInIndex; i++) {
        const currentSubset = sortedAssets.slice(0, i); // Take the top `i` assets
        const currentTotalRevenue = currentSubset.reduce((sum, asset) => sum + asset.revenue, 0);

        // Check if this subset has a higher total revenue
        if (currentTotalRevenue > maxTotalRevenue) {
            maxTotalRevenue = currentTotalRevenue;
            bestSubset = currentSubset;
        }
    }

    // If no assets exist, return an empty array
    if (bestSubset.length === 0) {
        return [];
    }

    // Step 4: Calculate and normalize portions for the best subset
    const totalRevenue = bestSubset.reduce((sum, asset) => sum + (asset as AssetWithRevenue).revenue, 0);

    // Step 5: Calculate raw and rounded portions
    const rawPortions = bestSubset.map(asset =>
        totalRevenue > 0 ? ((asset as AssetWithRevenue).revenue / totalRevenue) * 100 : 100 / bestSubset.length
    );

    // Round down all portions
    const roundedPortions = rawPortions.map(Math.floor);

    // Step 6: Adjust to ensure the total sum is exactly 100
    const totalRounded = roundedPortions.reduce((sum, portion) => sum + portion, 0);
    let difference = 100 - totalRounded;

    // Distribute the difference by increasing the portions with the highest remainders
    const remainders = rawPortions.map((portion, index) => ({
        index,
        remainder: portion - roundedPortions[index],
    }));

    // Sort remainders in descending order
    remainders.sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < difference; i++) {
        roundedPortions[remainders[i].index]++;
    }

    // Step 7: Return the result with normalized portions
    return bestSubset.map((asset, index) => ({
        id: asset.id,
        portion: roundedPortions[index],
    }));
}
