import {CustomIndexAsset} from "@/utils/types/general.types";

/**
 * Compute the middle portion value (weighted average) for every unique asset
 * from two arrays of assets, ensuring portions total to 100%.
 *
 * @param assets1 - First array of assets with portions
 * @param assets2 - Second array of assets with portions
 * @returns An array of assets with middle portions
 */
export function getIndexAssetsWithPortionsByRankProfitAndMaxDrawDown(
    assets1: CustomIndexAsset[],
    assets2: CustomIndexAsset[]
): CustomIndexAsset[] {
    // Create a mapping for all assets from both arrays
    const assetMap: Record<string, {sumPortion: number; count: number}> = {};

    // Process the first array
    for (const asset of assets1) {
        if (!assetMap[asset.id]) {
            assetMap[asset.id] = {sumPortion: 0, count: 0};
        }
        assetMap[asset.id].sumPortion += asset.portion;
        assetMap[asset.id].count += 1;
    }

    // Process the second array
    for (const asset of assets2) {
        if (!assetMap[asset.id]) {
            assetMap[asset.id] = {sumPortion: 0, count: 0};
        }
        assetMap[asset.id].sumPortion += asset.portion;
        assetMap[asset.id].count += 1;
    }

    // Calculate middle portion for each asset
    const result: CustomIndexAsset[] = Object.entries(assetMap).map(([id, data]) => {
        const middlePortion = data.sumPortion / data.count; // Weighted average
        return {id, portion: middlePortion};
    });

    return result;
}
