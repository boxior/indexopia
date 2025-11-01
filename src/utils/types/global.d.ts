// global.d.ts
export {}; // important for window.gtag to work

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        grecaptcha: {
            execute(siteKey: string, options: {action: string}): Promise<string>;
        };
    }
}
