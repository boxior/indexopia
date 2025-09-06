import {Id} from "@/utils/types/general.types";

export const SUPPORTED_LOCALES = ["en", "uk", "ru"];

export const DEFAULT_LOCALE = "en";

export const BRAND_NAME = "Indexopia";

export const DOMAIN_NAME = "indexopia";

export const MAX_ASSETS_COUNT = 50;

export const DEV_AUTH_NAME = "dev-auth";

export const DEV_AUTH_PATH = `/${DEV_AUTH_NAME}`;

export const PAGES_URLS = {
    home: "/",
    // auth
    authSignIn: "/auth/signin",
    authError: "/auth/error",
    authVerifyRequest: "/auth/verify-request",
    // indices
    indices: "/indices",
    index(id: Id) {
        return `/indices/${id}`;
    },
    // legal
    privacy: "/legal/privacy",
    terms: "/legal/terms",
    // contact
    contact: "/contact",
    //
    devAuth: `/${DEV_AUTH_NAME}`,
};
export const OMIT_ASSETS_IDS = [
    "tether",
    "usd-coin",
    "wrapped-bitcoin",
    "ethena-usde",
    "official-trump",
    "first-digital-usd",
];

export const MAX_DB_CONNECTIONS = 50;

export const HISTORY_OVERVIEW_DAYS = 30;

export const Z_INDEXES = {
    tooltip: 1000,
};

export const COLORS = {
    negative: "#ef4444",
    positive: "#10b981",
};

export const MAX_PORTION = 100;

export const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000; // Account for leap years

export const INDEX_VALIDATION = {
    name: {
        min: 2,
        max: 100, // characters
    },
    startingBalance: {
        min: 100,
        max: 100_000_000, // USD
    },
};

export const DEFAULT_INDEX_STARTING_BALANCE = 10_000;
