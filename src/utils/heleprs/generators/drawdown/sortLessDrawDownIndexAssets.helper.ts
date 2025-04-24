import {
    AssetHistory,
    AssetWithHistory,
    AssetWithMaxDrawDown,
    IndexHistory,
    MaxDrawDown,
} from "@/utils/types/general.types";

/**
 * Calculates the maximum drawdown (largest drop in profit/percentage) in the asset's price history.
 * Additionally, it returns the time range (start and end times) where this drawdown occurred.
 * @param history - Array of historical price data for an asset.
 * @returns Object containing the max drawdown and its associated time range.
 */
export function getMaxDrawDownWithTimeRange(history: (AssetHistory | IndexHistory)[] | undefined = []): MaxDrawDown {
    if (!history || history.length < 2) {
        // Not enough data to calculate drawdowns
        return {value: 0, startTime: "", endTime: ""};
    }

    // Convert priceUsd to numbers and keep corresponding times
    const prices = history.map(entry => parseFloat(entry.priceUsd));
    const times = history.map(entry => new Date(entry.time).toISOString());

    // Initialize variables to track max drawdown and time range
    let maxDrawDown = 0;
    let startTime = "";
    let endTime = "";
    let peakPrice = prices[0]; // Start with the first price as the highest peak seen so far
    let peakTime = times[0]; // Corresponding time for the peakPrice

    // Traverse through the price data to calculate drawdowns
    for (let i = 1; i < prices.length; i++) {
        const currentPrice = prices[i];
        const currentTime = times[i];

        if (currentPrice > peakPrice) {
            // Update the peak price and its time if a new peak is reached
            peakPrice = currentPrice;
            peakTime = currentTime;
        }

        // Calculate the drawdown from the current peak
        const drawdown = ((peakPrice - currentPrice) / peakPrice) * 100;

        // Update maxDrawDown and time range if the current drawdown is larger
        if (drawdown > maxDrawDown) {
            maxDrawDown = drawdown;
            startTime = peakTime; // The time of the peak
            endTime = currentTime; // The time of the lowest point after the peak
        }
    }

    return {value: maxDrawDown, startTime, endTime};
}

/**
 * Sort assets with the least maximum drawdown during a specific time range.
 * Also calculates the time range of the maximum drawdown for each asset.
 * @param assets - Array of Assets with history data.
 * @returns Array of Assets sorted by max drawdown in ascending order.
 */
export function sortLessMaxDrawDownIndexAssets({assets}: {assets: AssetWithHistory[]}): Array<AssetWithMaxDrawDown> {
    if (!assets || assets.length === 0) {
        return [];
    }

    // Process each asset to calculate max drawdown and its associated time range
    const assetsWithMaxDrawDown = assets.map(asset => {
        if (!asset.history || asset.history.length === 0) {
            return {...asset, maxDrawDown: {value: 0, startTime: "", endTime: ""}}; // Default if no history
        }

        // Calculate the max drawdown and its time range for the filtered history
        const maxDrawDown = getMaxDrawDownWithTimeRange(asset.history);

        return {...asset, maxDrawDown};
    });

    // Sort assets by max drawdown in ascending order (smallest max drawdown first)
    return assetsWithMaxDrawDown.toSorted((a, b) => a.maxDrawDown.value - b.maxDrawDown.value);
}
