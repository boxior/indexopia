// Helper function to calculate the timestamp for the next 00:00 UTC
export function getNextMidnightUTC(): number {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    return nextMidnight.getTime();
}

// Helper function to calculate the remaining seconds until the next 00:00 UTC
export function secondsUntilNextMidnightUTC(): number {
    const currentTime = Date.now(); // Current timestamp in milliseconds
    const nextMidnight = getNextMidnightUTC();
    return Math.floor((nextMidnight - currentTime) / 1000); // Difference in seconds
}

export const getCacheControlRequestHeaders = () => {
    return {["Cache-Control"]: `max-age=${secondsUntilNextMidnightUTC()}`};
};
