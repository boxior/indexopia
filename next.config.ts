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
                source: "/indexes",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=3600, private, stale-while-revalidate=0",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
