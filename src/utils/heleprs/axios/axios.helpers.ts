// Helper function to calculate the timestamp for the next 00:00 UTC
function getNextMidnightUTC(): number {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    return nextMidnight.getTime();
}

// Helper function to calculate the remaining seconds until the next 00:00 UTC
export function secondsUntilNextMidnightUTC(): number {
    const currentTime = performance.now(); // Current timestamp in milliseconds
    const nextMidnight = getNextMidnightUTC();
    return Math.floor((nextMidnight - currentTime) / 1000); // Difference in seconds
}
