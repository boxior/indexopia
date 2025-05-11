import {HistoryOverview} from "@/lib/db/helpers/db.helpers";

export type RecordWithId = Record<string, unknown> & {id: string};

export interface Asset {
    id: string; // "bitcoin"
    rank: string; // "1"
    symbol: string; // "BTC"
    name: string; // "Bitcoin"
    supply: string; // "19825181.0000000000000000"
    maxSupply: string | null; // "21000000.0000000000000000"
    marketCapUsd: string; // "1925275466470.2756778983560402"
    volumeUsd24Hr: string; // "3258694900.2738844391393532"
    priceUsd: string; //  "97112.6299664187518842"
    changePercent24Hr: string; // "-0.5596263726513635"
    vwap24Hr: string | null; // "97457.6771885174285351"
    explorer: string | null; // "https://blockchain.info/"
    history?: AssetHistory[];
    historyOverview?: HistoryOverview;
    maxDrawDown?: MaxDrawDown;
    portion?: number; // portion of Index
}

export enum DefaultIndexBy {
    RANK = "rank",
    RANK_AND_EXTRA = "rankAndExtra",
}

export enum DefaultIndexSortBy {
    PROFIT = "profit",
    MAX_DRAW_DOWN = "maxDrawDown",
    OPTIMAL = "optimal",
}

export type AssetWithProfit = Asset & {profit: number};

export type AssetWithMaxDrawDown = Asset & {maxDrawDown: {value: number; startTime: string; endTime: string}};

export type AssetWithProfitAndMaxDrawDown = AssetWithProfit & AssetWithMaxDrawDown;

export type CustomIndexAsset = Pick<Required<Asset>, "id" | "portion">;

export type CustomIndexAssetWithCustomIndexId = Pick<Required<Asset>, "id" | "portion"> & {customIndexId: string};

export type AssetWithHistory = Asset & {history: AssetHistory[]};

export type AssetWithHistoryAndOverview = Asset & {history: AssetHistory[]; historyOverview: HistoryOverview};

export type AssetWithHistoryOverviewAndPortion = Asset & {
    history: AssetHistory[];
    historyOverview: HistoryOverview;
    portion: number;
};

export type AssetWithHistoryOverviewPortionAndMaxDrawDown = Asset & {
    history: AssetHistory[];
    historyOverview: HistoryOverview;
    portion: number;
    maxDrawDown: MaxDrawDown;
};

export interface AssetHistory {
    assetId: string;
    priceUsd: string; // "priceUsd": "0.52126034102192210769",
    time: number; // "time": 1531180800000,
    date: string; // "date": "2018-07-10T00:00:00.000Z"
}

export type IndexHistory = Pick<AssetHistory, "priceUsd" | "time" | "date">;

export interface MaxDrawDown {
    value: number;
    startTime: string;
    endTime: string;
}

export type ChartData = {
    date: string;
    price: number;
};

export type NormalizedAssets = Record<Asset["id"], Asset>;

export type NormalizedAssetHistory = Record<Asset["id"], AssetHistory[]>;

export enum IndexId {
    TOP_5 = "top5",
    TOP_10 = "top10",
    TOP_25 = "top25",
    TOP_50 = "top50",
}

export interface Index<A = Asset> {
    id: IndexId | string;
    name: string;
    assets: A[];
    historyOverview: HistoryOverview;
    history: IndexHistory[];
    maxDrawDown: MaxDrawDown;
    startTime?: number;
    endTime?: number;
    isDefault?: boolean; // means system one.
}

export interface CustomIndexType {
    id: string;
    name: string;
    assets: CustomIndexAsset[];
    startTime?: number;
    isDefault?: boolean;
}

export type CustomIndexTypeDb = Omit<CustomIndexType, "isDefault" | "assets"> & {isDefault: number | null};

/**
 * @link https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
 */
export enum MomentFormat {
    DATE = "YYYY-MM-DD",
    DATE_TIME = "YYYY-MM-DD HH:mm",
    DAY_FULL = "dddd, MMMM Do YYYY",
    DAY_SHORT = "ddd, MMM Do",
    TIME = "HH:mm",
}

export type ServerPageProps<ID extends string = string> = {
    params: Promise<{id: ID}>;
    searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};
