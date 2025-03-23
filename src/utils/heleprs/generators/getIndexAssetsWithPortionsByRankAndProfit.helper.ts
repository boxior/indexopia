import {AssetWithProfit} from "@/utils/types/general.types";

export function getIndexAssetsWithPortionsByRankAndProfit(assets: AssetWithProfit[]): AssetWithProfit[] {
    // Parse ranks and sort assets by their rank (ascending order)
    const sortedAssets = assets.toSorted((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10));

    // Calculate the total "weight" based on both rank and profit for distributing the portions
    const totalWeight = sortedAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const profit = asset.profit / 100; // Assume profit is a numeric value
        return sum + (1 / rank) * profit; // Higher profit and lower rank give a larger weight
    }, 0);

    // Assign portions proportionally based on the combined weight
    let remainingPortion = 100;
    return sortedAssets.map((asset, index) => {
        const rank = parseInt(asset.rank, 10);
        const profit = asset.profit / 100;
        const weight = (1 / rank) * profit;
        const portion = Math.round((weight / totalWeight) * 100);

        // Ensure the last asset gets exactly the remaining portion to avoid rounding issues
        if (index === sortedAssets.length - 1) {
            return {...asset, portion: remainingPortion};
        }

        remainingPortion -= portion;
        return {...asset, portion};
    });
}
