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
    DEV_API_KEY: process.env.NEXT_PUBLIC_DEV_API_KEY ?? "",
};

console.log("ENV_VARIABLES", ENV_VARIABLES);
