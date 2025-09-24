interface EnvVariables {
    PORT: string;
    NODE_ENV: string;
    MY_ENV: string;
    COINCAP_API_URL: string;
    COINCAP_API_KEY: string;
    COINCAP_PRO_API_URL: string;
    COINCAP_PRO_API_KEY: string;
    ALPHA_VANTAGE_API_KEY: string;
    DEV_API_KEY: string;
    // MYSQL
    MYSQL_HOST: string;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_DATABASE: string;
    MYSQL_TABLE_NAME_ASSETS: string;
    MYSQL_TABLE_NAME_ASSET_HISTORY: string;
    MYSQL_TABLE_NAME_INDICES_OVERVIEW: string;
    API_KEY: string;
    // SSL
    SSL_SECRET_KEY: string;
    SSL_ALGORITHM: string;
    SSL_CERT: string;
    AUTH_RESEND_KEY: string;
    // Public
    NEXT_PUBLIC_SITE_URL: string;
}

// Parse environment variables and ensure they have the correct types
// Example: Vercel uses `process.env.PORT` and Amplify uses `process.env.NEXT_PUBLIC_PORT`
export const ENV_VARIABLES: EnvVariables = {
    PORT: process.env.PORT ?? process.env.NEXT_PUBLIC_PORT ?? "",
    NODE_ENV: process.env.NODE_ENV ?? process.env.NEXT_PUBLIC_NODE_ENV ?? "",
    MY_ENV: process.env.MY_ENV ?? process.env.NEXT_PUBLIC_MY_ENV ?? "",
    COINCAP_API_URL: process.env.COINCAP_API_URL ?? process.env.NEXT_PUBLIC_COINCAP_API_URL ?? "",
    COINCAP_API_KEY: process.env.COINCAP_API_KEY ?? process.env.NEXT_PUBLIC_COINCAP_API_KEY ?? "",
    COINCAP_PRO_API_URL: process.env.COINCAP_PRO_API_URL ?? process.env.NEXT_PUBLIC_COINCAP_PRO_API_URL ?? "",
    COINCAP_PRO_API_KEY: process.env.COINCAP_PRO_API_KEY ?? process.env.NEXT_PUBLIC_COINCAP_PRO_API_KEY ?? "",
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ?? process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ?? "",
    DEV_API_KEY: process.env.DEV_API_KEY ?? process.env.NEXT_PUBLIC_DEV_API_KEY ?? "",
    // MYSQL
    MYSQL_HOST: process.env.MYSQL_HOST ?? process.env.NEXT_PUBLIC_MYSQL_HOST ?? "",
    MYSQL_USER: process.env.MYSQL_USER ?? process.env.NEXT_PUBLIC_MYSQL_USER ?? "",
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ?? process.env.NEXT_PUBLIC_MYSQL_PASSWORD ?? "",
    MYSQL_DATABASE: process.env.MYSQL_DATABASE ?? process.env.NEXT_PUBLIC_MYSQL_DATABASE ?? "",
    MYSQL_TABLE_NAME_ASSETS:
        process.env.MYSQL_TABLE_NAME_ASSETS ?? process.env.NEXT_PUBLIC_MYSQL_TABLE_NAME_ASSETS ?? "",
    MYSQL_TABLE_NAME_ASSET_HISTORY:
        process.env.MYSQL_TABLE_NAME_ASSET_HISTORY ?? process.env.NEXT_PUBLIC_MYSQL_TABLE_NAME_ASSET_HISTORY ?? "",
    MYSQL_TABLE_NAME_INDICES_OVERVIEW:
        process.env.MYSQL_TABLE_NAME_INDICES_OVERVIEW ??
        process.env.NEXT_PUBLIC_MYSQL_TABLE_NAME_INDICES_OVERVIEW ??
        "",
    API_KEY: process.env.API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? "",
    SSL_SECRET_KEY: process.env.SSL_SECRET_KEY ?? process.env.SSL_SECRET_KEY ?? "",
    SSL_ALGORITHM: process.env.SSL_ALGORITHM ?? process.env.SSL_ALGORITHM ?? "",
    SSL_CERT: process.env.SSL_CERT ?? process.env.SSL_CERT ?? "",
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY ?? process.env.AUTH_RESEND_KEY ?? "",
    // Public
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "",
};

console.log("ENV_VARIABLES", ENV_VARIABLES);
