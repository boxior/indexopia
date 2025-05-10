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
    MYSQL_TABLE_NAME_CUSTOM_INDEX: string;
    TABLE_NAME_CUSTOM_INDEX_ASSETS: string;
    TABLE_NAME_INDEX: string;
    TABLE_NAME_INDEX_ASSET: string;
    TABLE_NAME_INDEX_HISTORY: string;
    API_KEY: string;
}

// Parse environment variables and ensure they have the correct types
export const ENV_VARIABLES: EnvVariables = {
    PORT: process.env.PORT ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "",
    MY_ENV: process.env.MY_ENV ?? "",
    COINCAP_API_URL: process.env.COINCAP_API_URL ?? "",
    COINCAP_API_KEY: process.env.COINCAP_API_KEY ?? "",
    COINCAP_PRO_API_URL: process.env.COINCAP_PRO_API_URL ?? "",
    COINCAP_PRO_API_KEY: process.env.COINCAP_PRO_API_KEY ?? "",
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ?? "",
    DEV_API_KEY: process.env.DEV_API_KEY ?? "",
    // MYSQL
    MYSQL_HOST: process.env.MYSQL_HOST ?? "",
    MYSQL_USER: process.env.MYSQL_USER ?? "",
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ?? "",
    MYSQL_DATABASE: process.env.MYSQL_DATABASE ?? "",
    MYSQL_TABLE_NAME_ASSETS: process.env.MYSQL_TABLE_NAME_ASSETS ?? "",
    MYSQL_TABLE_NAME_ASSET_HISTORY: process.env.MYSQL_TABLE_NAME_ASSET_HISTORY ?? "",
    MYSQL_TABLE_NAME_CUSTOM_INDEX: process.env.MYSQL_TABLE_NAME_CUSTOM_INDEX ?? "",
    TABLE_NAME_CUSTOM_INDEX_ASSETS: process.env.TABLE_NAME_CUSTOM_INDEX_ASSETS ?? "",
    TABLE_NAME_INDEX: process.env.TABLE_NAME_INDEX ?? "",
    TABLE_NAME_INDEX_ASSET: process.env.TABLE_NAME_INDEX_ASSET ?? "",
    TABLE_NAME_INDEX_HISTORY: process.env.TABLE_NAME_INDEX_HISTORY ?? "",
    API_KEY: process.env.API_KEY ?? "",
};

console.log("ENV_VARIABLES", ENV_VARIABLES);
