import "../envConfig.ts";

interface EnvVariables {
    PORT: string;
    NODE_ENV: string;
    NEXT_PUBLIC_API_URL: string;
    MY_ENV: string;
    COINCAP_API_URL: string;
    COINCAP_API_KEY: string;
}

// Parse environment variables and ensure they have the correct types
export const ENV_VARIABLES: EnvVariables = {
    PORT: process.env.PORT ?? "",
    NODE_ENV: process.env.NODE_ENV ?? "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
    MY_ENV: process.env.MY_ENV ?? "",
    COINCAP_API_URL: process.env.COINCAP_API_URL ?? "",
    COINCAP_API_KEY: process.env.COINCAP_API_KEY ?? "",
};

console.log("ENV_VARIABLES", ENV_VARIABLES);
