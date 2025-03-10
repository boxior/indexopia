import {IndexId, MomentFormat} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";
import moment from "moment/moment";

export const getChartColorClassname = (value: number) => {
    return value < 0 ? "text-red-500" : "text-green-500";
};

export const getChartColor = (value: number) => {
    return value < 0 ? "#ef4444" : "#22c55e";
};

export const getIndexStartFromLabel = (startTime: number) => {
    return momentTimeZone.tz(startTime, "UTC").startOf("day").format(MomentFormat.DATE);
};

export const getIndexDurationLabel = (startTime: number) => {
    // Calculate the duration difference in days
    const now = moment().utc().startOf("day");
    const start = moment(startTime).utc().startOf("day");
    const duration = moment.duration(now.diff(start)); // Create a moment duration

    // Break down the duration into years, months, and days
    const years = duration.years() > 0 ? `${duration.years()} year${duration.years() > 1 ? "s" : ""} ` : "";
    const months = duration.months() > 0 ? `${duration.months()} month${duration.months() > 1 ? "s" : ""} ` : "";
    const days = duration.days() > 0 ? `${duration.days()} day${duration.days() > 1 ? "s" : ""}` : "";

    return `${years}${months}${days}`.trim() || "0 days";
};

export const getIsDefaultIndex = (id: string) => {
    return Object.values(IndexId).includes(id as IndexId);
};
