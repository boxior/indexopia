import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    /* config options here */
    // webpack: config => {
    //     config.module.rules.push({
    //         test: /\.(js|ts)$/,
    //         exclude: [/src\/backend/], // Exclude /src/backend folder
    //     });
    //     return config;
    // },
    experimental: {
        cacheComponents: true,
    },
    // Alternative: use route configuration
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-store, must-revalidate",
                    },
                ],
            },
        ];
    },

    compress: true,
};

export default withNextIntl(nextConfig);
