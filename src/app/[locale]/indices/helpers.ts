import {AssetHistory, IndexOverview} from "@/utils/types/general.types";
import moment from "moment/moment";
import {TOP_PERFORMANCE_COUNT} from "@/app/[locale]/indices/components/CLAUD_WEB/IndicesFilters";

export type DurationUnit = "years" | "months" | "days" | "zero";
export type DurationTranslator = (unit: DurationUnit, values?: {count?: number}) => string;

// Localized duration label. Optionally accepts a translator from next-intl:
// const tDuration = useTranslations("indices.duration");
// getIndexDurationLabel(start, end, (unit, v) => tDuration(unit, v));
export const getIndexDurationLabel = (startTime: number, endTime: number, t?: DurationTranslator) => {
    // Calculate the duration difference in days
    const end = moment(endTime).utc().startOf("day");
    const start = moment(startTime).utc().startOf("day");
    const duration = moment.duration(end.diff(start)); // Create a moment duration

    // Break down the duration into years, months, and days
    const y = duration.years();
    const m = duration.months();
    const d = duration.days();

    const format = (unit: Exclude<DurationUnit, "zero">, count: number) => {
        if (!t) {
            // Fallback to English if translator is not provided
            const plural = count === 1 ? "" : "s";
            return `${count} ${unit.slice(0, -1)}${plural}`;
        }
        return t(unit, {count});
    };

    const parts: string[] = [];
    if (y > 0) parts.push(format("years", y));
    if (m > 0) parts.push(format("months", m));
    if (d > 0) parts.push(format("days", d));

    if (parts.length === 0) {
        return t ? t("zero") : "0 days";
    }
    return parts.join(" ");
};

/**
 * Function to populate absent records for a list of assets
 * @param histories - Array of asset records sorted by date (ascending).
 * @param lastHistoryBefore - Asset history to clone from if no records exist for a specific day
 * @param startTime - Start time filter (Unix timestamp in milliseconds)
 * @param endTime - End time filter (Unix timestamp in milliseconds)
 * @returns Array with missing records populated within the specified time range.
 */
export function populateMissingAssetHistory<D extends Omit<AssetHistory, "assetId"> = AssetHistory>({
    histories,
    lastHistoryBefore,
    endTime,
    startTime,
}: {
    histories: D[];
    startTime: number;
    endTime: number;
    lastHistoryBefore?: D;
}): D[] {
    const assetStartTime = lastHistoryBefore ? startTime : histories[0]?.time;
    if (!assetStartTime) {
        return [];
    }
    const times = getDaysArray(assetStartTime, endTime);

    const filteredHistories = histories.filter(h => times.includes(h.time));

    const filledRecords: D[] = [];

    for (const time of times) {
        const existedHistory = filteredHistories.find(h => h.time === time);

        if (existedHistory) {
            filledRecords.push(existedHistory);
            continue;
        }

        const prevTime = moment(time).utc().startOf("day").subtract(1, "day").valueOf();
        const prevHistory = filledRecords.find(h => h.time === prevTime) ?? lastHistoryBefore;

        const date = moment(time).utc().toISOString();

        prevHistory &&
            filledRecords.push({
                ...prevHistory,
                time,
                date,
                clonedFrom: prevHistory.date,
            });
    }

    return filledRecords;
}

/**
 * Generate an array of days between startTime and endTime
 * @param startTime - Start time (Unix timestamp in milliseconds)
 * @param endTime - End time (Unix timestamp in milliseconds)
 * @returns Array of Unix timestamps representing start of each day in UTC
 */
export const getDaysArray = (startTime: number, endTime: number): number[] => {
    const days: number[] = [];

    // Convert to UTC and get start of day for both times
    const start = moment(startTime).utc().startOf("day");
    const end = moment(endTime).utc().startOf("day");

    // Iterate through each day from start to end (inclusive)
    const current = start.clone();
    while (current.isBefore(end)) {
        days.push(current.valueOf()); // Unix timestamp in milliseconds
        current.add(1, "day");
    }

    return days;
};

export const filterTopPerformance = (indices: IndexOverview[], count: number | undefined = TOP_PERFORMANCE_COUNT) => {
    return indices.toSorted((a, b) => b.historyOverview.total - a.historyOverview.total).slice(0, count);
};
