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
                source: "/:path*",
                headers: [{key: "Cache-Control", value: "public, max-age=31536000, immutable"}],
            },
        ];
    },
};

export default nextConfig;
