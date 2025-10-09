// global.d.ts

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

declare const grecaptcha: {
    execute(siteKey: string, options: {action: string}): Promise<string>;
};
