import {AssetWithHistory, AssetWithProfit} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";

/**
 * Helper function to sort most profitable assets within a specific time range.
 * @param assets - Array of Assets with history data.
 * @param startTime - Start of the period (timestamp or date).
 * @param endTime - End of the period (timestamp or date).
 * @returns Array of the most profitable Assets.
 */
export function sortMostProfitableAssets({
    assets,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    assets: AssetWithHistory[];
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}): (AssetWithProfit & AssetWithHistory)[] {
    const startTime = momentTimeZone.tz(startTimeProp ?? assets[0].history?.[0]?.time, "UTC").valueOf();
    const endTime = momentTimeZone
        .tz(endTimeProp ?? assets[0].history?.[(assets[0].history?.length ?? 0) - 1]?.time, "UTC")
        .valueOf();

    // Calculate the profit for each asset based on startTime and endTime
    const assetsWithProfit = assets
        .map(asset => {
            if (!asset.history || asset.history.length === 0) {
                return {...asset, profit: 0};
            }

            // Filter the history to get prices within the time range
            const filteredHistory = asset.history.filter(entry => {
                const time = new Date(entry.time).getTime();
                return time >= startTime && time <= endTime;
            });

            if (filteredHistory.length < 2) {
                // Insufficient data for the period
                return {...asset, profit: 0};
            }

            // Get the start and end prices within the period
            const startPrice = parseFloat(filteredHistory[0].priceUsd);
            const endPrice = parseFloat(filteredHistory[filteredHistory.length - 1].priceUsd);

            // Calculate profit as a percentage
            const profit = ((endPrice - startPrice) / startPrice) * 100;

            return {...asset, profit};
        })
        // Exclude assets with 0 profit
        .filter(asset => asset.profit !== 0);

    // Sort assets by profit in descending order
    return assetsWithProfit.toSorted((a, b) => b.profit - a.profit);
}
