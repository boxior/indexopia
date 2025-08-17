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
        dynamicIO: true,
    },
    compress: true,
};

export default withNextIntl(nextConfig);
