import {AssetHistory, IndexOverview, MomentFormat} from "@/utils/types/general.types";
import moment from "moment/moment";
import {convertToUTC} from "@/utils/heleprs/convertToUTC.helper";
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
