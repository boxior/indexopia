import type {NextConfig} from "next";

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
        dynamicIO: true,
    },
    compress: true,
    async headers() {
        return [
            {
                source: "/:path*", // Apply to all routes and files
                headers: [
                    {
                        key: "Cache-Control",
                        value: "s-maxage=31536000, stale-while-revalidate=604800",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
