/**
 * A helper function that returns a promise which resolves after a specified delay.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>}
 */
export function promiseDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
