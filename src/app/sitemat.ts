import {MetadataRoute} from "next";
import {routing} from "@/i18n/routing";
import {ENV_VARIABLES} from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = ENV_VARIABLES.NEXT_PUBLIC_SITE_URL;

    const locales = routing.locales;

    // Core routes you want indexed. Add more important sections as needed.
    const basePaths = ["/", "/indices", "/privacy"];

    const entries: MetadataRoute.Sitemap = [];

    for (const path of basePaths) {
        // Build one URL record per locale with alternates
        const alternates: Record<string, string> = {};
        for (const l of locales) {
            alternates[l] = `${siteUrl}/${l}${path === "/" ? "" : path}`;
        }

        // Use the current default locale as the primary URL
        const primaryLocale = locales[0];
        const primaryUrl = alternates[primaryLocale];

        entries.push({
            url: primaryUrl,
            lastModified: new Date(),
            changeFrequency: path === "/" ? "daily" : "weekly",
            priority: path === "/" ? 1.0 : 0.7,
            alternates: {
                languages: alternates,
            },
        });
    }

    return entries;
}
