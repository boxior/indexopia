import {IndexId} from "@/utils/types/general.types";

export const ASSET_COUNT_BY_INDEX_ID: Record<IndexId, number> = {
    [IndexId.TOP_5]: 5,
    [IndexId.TOP_10]: 10,
    [IndexId.TOP_25]: 25,
    [IndexId.TOP_50]: 50,
};

export const INDEX_NAME_BY_INDEX_ID: Record<IndexId, string> = {
    [IndexId.TOP_5]: "Index 5",
    [IndexId.TOP_10]: "Index 10",
    [IndexId.TOP_25]: "Index 25",
    [IndexId.TOP_50]: "Index 50",
};
