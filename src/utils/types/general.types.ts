export type RecordWithId = Record<string, unknown> & {id: string};

/**
 * In %
 */
export type HistoryOverview = {
    days1: number;
    days7: number;
    days30: number;
    total: number;
};

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
    portion?: number; // portion of Index in %
}

export enum SystemIndexBy {
    RANK = "rank",
    EXTRA = "extra",
}

export enum SystemIndexSortBy {
    PROFIT = "profit",
    MAX_DRAW_DOWN = "maxDrawDown",
    OPTIMAL = "optimal",
}

export type AssetWithProfit = Asset & {profit: number};

export type AssetWithMaxDrawDown = Asset & {maxDrawDown: {value: number; startTime: string; endTime: string}};

export type AssetWithProfitAndMaxDrawDown = AssetWithProfit & AssetWithMaxDrawDown;

export type AssetWithHistory = Asset & {history: AssetHistory[]};

export type AssetWithHistoryAndOverview<A = Asset> = A & {history: AssetHistory[]; historyOverview: HistoryOverview};

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

export interface Index<A = Asset> {
    id: Id;
    name: string;
    assets: A[];
    historyOverview: HistoryOverview;
    history: IndexHistory[];
    maxDrawDown: MaxDrawDown;
    systemId?: string;
    userId?: string;
    startTime?: number;
    endTime?: number;
}

export type IndexOverviewAsset = Pick<Required<Asset>, "id" | "name" | "symbol" | "rank" | "portion">;

export type IndexOverview = Pick<
    Index,
    "id" | "systemId" | "userId" | "name" | "historyOverview" | "maxDrawDown" | "startTime" | "endTime"
> & {assets: IndexOverviewAsset[]};

export type IndexOverviewWithHistory = IndexOverview & {history: IndexHistory[]};

export type IndexOverviewForCreate = Omit<IndexOverview, "id"> & {id?: Id};

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

export type PageProps = {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
    searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

export type Id = string | number;

export type SaveSystemIndexProps = {
    systemIndexBy: SystemIndexBy;
    systemIndexSortBy: SystemIndexSortBy;
    upToNumber?: number;
    topAssetsCount?: number;
    startTime?: number;
    endTime?: number;
    equalPortions?: boolean;
    name?: string;
};

export enum IndexDBName {
    INDEX_HISTORY = "indexHistory",
    INDEX_OVERVIEW = "indexOverview",
}

export enum EntityMode {
    VIEW = "view",
}
