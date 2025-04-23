import {AssetWithMaxDrawDown, CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Calculate portions of assets based on their rank and maxDrawDown.
 * Lower maxDrawDown and higher rank contribute to a larger portion.
 * Ensures that no single asset has more than 50% of the portion,
 * and the total sum of all portions equals 100.
 */
export function getIndexAssetsWithPortionsByRankAndMaxDrawDown(assets: AssetWithMaxDrawDown[]): CustomIndexAsset[] {
    // Parse ranks and sort assets by their rank (ascending order)
    const sortedAssets = assets.toSorted((a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10));

    // Calculate the total "weight" for initial portion distribution
    const totalWeight = sortedAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const maxDrawDown = asset.maxDrawDown.value; // Assume `maxDrawDown.value` is a positive numeric value
        return sum + (1 / rank) * (1 / maxDrawDown); // Lower maxDrawDown (and lower rank) gives a larger weight
    }, 0);

    // Initial portion calculation based on weight
    let portions = sortedAssets.map(asset => {
        const rank = parseInt(asset.rank, 10);
        const maxDrawDown = asset.maxDrawDown.value;
        const weight = (1 / rank) * (1 / maxDrawDown); // Weight inversely proportional to `maxDrawDown`
        const portion = Math.round((weight / totalWeight) * 100);
        return {...asset, portion};
    });

    // Step 1: Cap any portion to a maximum of 50% and calculate excess to redistribute
    const maxPortion = 50;
    let excessPortion = 0;

    portions = portions.map(asset => {
        if (asset.portion > maxPortion) {
            excessPortion += asset.portion - maxPortion;
            return {...asset, portion: maxPortion};
        }
        return asset;
    });

    // Step 2: Redistribute excess portion proportionally to the remaining assets
    const distributableAssets = portions.filter(asset => asset.portion < maxPortion);
    const totalRedistributableWeight = distributableAssets.reduce((sum, asset) => {
        const rank = parseInt(asset.rank, 10);
        const maxDrawDown = asset.maxDrawDown.value;
        return sum + (1 / rank) * (1 / maxDrawDown);
    }, 0);

    portions = portions.map(asset => {
        if (asset.portion < maxPortion) {
            const rank = parseInt(asset.rank, 10);
            const maxDrawDown = asset.maxDrawDown.value;
            const weight = (1 / rank) * (1 / maxDrawDown);
            const additionalPortion = Math.round((weight / totalRedistributableWeight) * excessPortion);
            return {
                ...asset,
                portion: Math.min(maxPortion, asset.portion + additionalPortion),
            };
        }
        return asset;
    });

    // Step 3: Ensure the total sum of portions equals exactly 100
    const totalPortions = portions.reduce((sum, asset) => sum + asset.portion, 0);
    const correction = 100 - totalPortions;

    // Apply correction to the asset with the smallest current portion
    if (correction !== 0) {
        const assetToCorrect = portions.reduce((minAsset, asset) =>
            asset.portion < minAsset.portion ? asset : minAsset
        );
        portions = portions.map(asset =>
            asset === assetToCorrect ? {...asset, portion: asset.portion + correction} : asset
        );
    }

    return portions;
}
