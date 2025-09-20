import {MetadataRoute} from "next";
import {ENV_VARIABLES} from "@/env";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = ENV_VARIABLES.NEXT_PUBLIC_SITE_URL;

    const isProd = process.env.NODE_ENV === "production";
    const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

    // Allow indexing only in production
    const allowIndexing = isProd && !isPreview;

    return {
        rules: [
            {
                userAgent: "*",
                allow: allowIndexing ? "/" : "",
                disallow: allowIndexing ? "" : "/",
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
