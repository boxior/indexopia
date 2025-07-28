import {Id} from "@/utils/types/general.types";

export const MAX_ASSETS_COUNT = 50;

export const DEV_AUTH_NAME = "dev-auth";

export const DEV_AUTH_PATH = `/${DEV_AUTH_NAME}`;

export const PAGES_URLS = {
    home: "/",
    // auth
    signIn: "/auth/signin",
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
