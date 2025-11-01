/**
 * This fetcher is used for GET requests
 * @source https://swr.vercel.app/docs/getting-started#quick-start
 * @param args
 */
// @ts-ignore
export const fetcher = (...args: any[]) => fetch(...args).then(res => res.json());
