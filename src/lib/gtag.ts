// lib/gtag.ts
import {ENV_VARIABLES} from "@/env";

// log page views
export const pageview = (url: string) => {
    window.gtag("config", ENV_VARIABLES.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
    });
};
