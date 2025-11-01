import {MetadataRoute} from "next";
import {ENV_VARIABLES} from "@/env";
import {routing} from "@/i18n/routing";

function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = ENV_VARIABLES.NEXT_PUBLIC_SITE_URL;
    const locales = routing.locales;
    const defaultLocale = routing.defaultLocale;

    // Core routes you want indexed
    const basePaths = ["/", "/indices", "/legal/privacy", "/legal/terms"];

    const entries: MetadataRoute.Sitemap = [];

    for (const path of basePaths) {
        for (const locale of locales) {
            // Build alternates for all locales
            const alternates: Record<string, string> = {};

            for (const l of locales) {
                // Use default locale without prefix, others with prefix
                if (l === defaultLocale) {
                    alternates[l] = `${siteUrl}${path === "/" ? "/" : path}`;
                } else {
                    alternates[l] = `${siteUrl}/${l}${path === "/" ? "" : path}`;
                }
            }

            // Generate URL for current locale
            let url: string;
            if (locale === defaultLocale) {
                url = `${siteUrl}${path === "/" ? "/" : path}`;
            } else {
                url = `${siteUrl}/${locale}${path === "/" ? "" : path}`;
            }

            entries.push({
                url: url,
                lastModified: new Date(),
                changeFrequency: path === "/" ? "daily" : "weekly",
                priority: path === "/" ? 1.0 : 0.8,
                alternates: {
                    languages: alternates,
                },
            });
        }
    }

    return entries;
}

export default sitemap;
