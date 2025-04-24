import momentTimeZone from "moment-timezone";

// Ensure every date in the records is handled in UTC
export const convertToUTC = (date: string | number) => momentTimeZone.tz(date, "UTC"); // Convert to moment object in UTC
