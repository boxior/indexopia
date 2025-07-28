import {AssetHistory, IndexOverview, MomentFormat} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
import moment from "moment/moment";
import {convertToUTC} from "@/utils/heleprs/convertToUTC.helper";
import {TOP_PERFORMANCE_COUNT} from "@/app/indices/components/CLAUD_WEB/IndicesFilters";

export const getChartColorClassname = (value: number) => {
    return value < 0 ? "text-red-500" : "text-green-500";
};

export const getChartColor = (value: number) => {
    return value < 0 ? "#ef4444" : "#22c55e";
};

export const getIndexStartFromLabel = (startTime: number) => {
    return momentTimeZone.tz(startTime, "UTC").startOf("day").format(MomentFormat.DATE);
};

export const getIndexDurationLabel = (startTime: number, endTime: number) => {
    // Calculate the duration difference in days
    const end = moment(endTime).utc().startOf("day");
    const start = moment(startTime).utc().startOf("day");
    const duration = moment.duration(end.diff(start)); // Create a moment duration

    // Break down the duration into years, months, and days
    const years = duration.years() > 0 ? `${duration.years()} year${duration.years() > 1 ? "s" : ""} ` : "";
    const months = duration.months() > 0 ? `${duration.months()} month${duration.months() > 1 ? "s" : ""} ` : "";
    const days = duration.days() > 0 ? `${duration.days()} day${duration.days() > 1 ? "s" : ""}` : "";

    return `${years}${months}${days}`.trim() || "0 days";
};

/**
 * Function to populate absent records for a list of assets
 * @param histories - Array of asset records sorted by date (ascending).
 * @returns Array with missing records populated.
 */
export function populateMissingAssetHistory<D extends Omit<AssetHistory, "assetId"> = AssetHistory>(
    histories: D[]
): D[] {
    if (histories.length === 0) return [];

    const filledRecords: D[] = [];
    let previousRecord = histories[0];

    // Iterate over each record
    for (let i = 1; i < histories.length; i++) {
        const currentRecord = histories[i];

        // Add the previous record to the result
        filledRecords.push(previousRecord);

        // Convert dates to UTC for comparison
        const previousDate = convertToUTC(previousRecord.date);
        const currentDate = convertToUTC(currentRecord.date);

        // Calculate days between the current and previous records
        const daysGap = currentDate.diff(previousDate, "days");

        // Fill in missing records for days in between
        for (let day = 1; day < daysGap; day++) {
            const missingDate = previousDate.clone().add(day, "days"); // Generate missing date in UTC

            filledRecords.push({
                ...previousRecord,
                time: missingDate.valueOf(), // Unix timestamp in milliseconds
                date: missingDate.toISOString(), // ISO string in UTC
            });
        }

        // Update the previous record to the current one
        previousRecord = currentRecord;
    }

    // Push the final record
    filledRecords.push(previousRecord);

    return filledRecords;
}

export const filterTopPerformance = (indices: IndexOverview[], count: number | undefined = TOP_PERFORMANCE_COUNT) => {
    return indices.toSorted((a, b) => b.historyOverview.total - a.historyOverview.total).slice(0, count);
};
