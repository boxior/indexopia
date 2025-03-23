import {Asset, AssetHistory, AssetWithMaxDrawDown} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";

/**
 * Calculates the maximum drawdown (largest drop in profit/percentage) in the asset's price history.
 * Additionally, it returns the time range (start and end times) where this drawdown occurred.
 * @param history - Array of historical price data for an asset.
 * @returns Object containing the max drawdown and its associated time range.
 */
function getMaxDrawDownWithTimeRange(history: AssetHistory[]): {
    value: number;
    startTime: string;
    endTime: string;
} {
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
 * @param startTime - Start of the period (optional).
 * @param endTime - End of the period (optional).
 * @returns Array of Assets sorted by max drawdown in ascending order.
 */
export function sortLessMaxDrawDownIndexAssets({
    assets,
    startTime: startTimeProp,
    endTime: endTimeProp,
}: {
    assets: Asset[];
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}): Array<AssetWithMaxDrawDown> {
    if (!assets || assets.length === 0) {
        return [];
    }

    // Define the time range
    const startTime = momentTimeZone.tz(startTimeProp ?? assets[0]?.history?.[0]?.time, "UTC").valueOf();
    const endTime = momentTimeZone
        .tz(endTimeProp ?? assets[0]?.history?.[(assets[0]?.history?.length ?? 0) - 1]?.time, "UTC")
        .valueOf();

    // Process each asset to calculate max drawdown and its associated time range
    const assetsWithMaxDrawDown = assets.map(asset => {
        if (!asset.history || asset.history.length === 0) {
            return {...asset, maxDrawDown: {value: 0, startTime: "", endTime: ""}}; // Default if no history
        }

        // Filter the history data within the specified time range
        const filteredHistory = asset.history.filter(entry => {
            const time = new Date(entry.time).getTime();
            return time >= startTime && time <= endTime;
        });

        if (filteredHistory.length < 2) {
            // Not enough data to calculate max drawdown
            return {...asset, maxDrawDown: {value: 0, startTime: "", endTime: ""}};
        }

        // Calculate the max drawdown and its time range for the filtered history
        const maxDrawDown = getMaxDrawDownWithTimeRange(filteredHistory);

        return {...asset, maxDrawDown};
    });

    // Sort assets by max drawdown in ascending order (smallest max drawdown first)
    return assetsWithMaxDrawDown.toSorted((a, b) => a.maxDrawDown.value - b.maxDrawDown.value);
}
