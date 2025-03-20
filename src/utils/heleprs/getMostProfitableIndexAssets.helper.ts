import {Asset, CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Helper function to calculate the most profitable index based on asset history.
 * @param assets - Array of Assets with history data.
 * @param upToAssetsInIndex - Maximum number of assets allowed in the Index.
 * @returns Array of Assets with their `portion` values set.
 */
export function getMostProfitableIndex(assets: Asset[], upToAssetsInIndex: number): CustomIndexAsset[] {
    // Calculate the revenue (profit percentage) for each asset based on its historical data
    const assetsWithRevenue = assets.map(asset => {
        if (!asset.history || asset.history.length === 0) {
            return {...asset, revenue: 0};
        }

        const startPrice = parseFloat(asset.history[0].priceUsd);
        const endPrice = parseFloat(asset.history[asset.history.length - 1].priceUsd);

        const revenue = ((endPrice - startPrice) / startPrice) * 100; // Revenue in percentage
        return {...asset, revenue};
    });

    // Sort assets by their revenue in descending order
    const sortedAssets = assetsWithRevenue.sort((a, b) => b.revenue - a.revenue);

    // Select the top `upToAssetsInIndex` most profitable assets
    const topAssets = sortedAssets.slice(0, upToAssetsInIndex);

    // Calculate the total revenue for normalizing portions
    const totalRevenue = topAssets.reduce((sum, asset) => sum + asset.revenue, 0);

    // Step 1: Calculate raw portions
    const rawPortions = topAssets.map(asset =>
        totalRevenue > 0 ? (asset.revenue / totalRevenue) * 100 : 100 / topAssets.length
    );

    // Step 2: Calculate rounded portions
    const roundedPortions = rawPortions.map(Math.floor);

    // Step 3: Adjust portions to ensure the sum is exactly 100
    const totalRounded = roundedPortions.reduce((sum, portion) => sum + portion, 0);
    let difference = 100 - totalRounded; // Difference between rounded sum and 100

    // Distribute the difference among assets, prioritizing the largest remainders
    const remainders = rawPortions.map((portion, index) => ({
        index,
        remainder: portion - roundedPortions[index],
    }));

    // Sort by remainder in descending order so larger remainders are increased first
    remainders.sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < difference; i++) {
        roundedPortions[remainders[i].index]++;
    }

    // Return the result with adjusted portions
    return topAssets.map((asset, index) => ({
        id: asset.id,
        portion: roundedPortions[index],
    }));
}
