import {HistoryOverview} from "@/app/api/assets/db.helpers";

export type RecordWithId = Record<string, unknown> & {id: string};

export interface Asset {
    id: string; // "bitcoin"
    rank: string; // "1"
    symbol: string; // "BTC"
    name: string; // "Bitcoin"
    supply: string; // "19825181.0000000000000000"
    maxSupply: string; // "21000000.0000000000000000"
    marketCapUsd: string; // "1925275466470.2756778983560402"
    volumeUsd24Hr: string; // "3258694900.2738844391393532"
    priceUsd: string; //  "97112.6299664187518842"
    changePercent24Hr: string; // "-0.5596263726513635"
    vwap24Hr: string; // "97457.6771885174285351"
    explorer: string; // "https://blockchain.info/"
}

export interface AssetHistory {
    priceUsd: string; // "priceUsd": "0.52126034102192210769",
    time: number; // "time": 1531180800000,
    date: string; // "date": "2018-07-10T00:00:00.000Z"
}

export type NormalizedAssets = Record<Asset["id"], Asset>;

export type NormalizedAssetHistory = Record<Asset["id"], AssetHistory[]>;

export enum IndexId {
    TOP_5 = "top5",
    TOP_10 = "top10",
    TOP_30 = "top30",
    TOP_50 = "top50",
}
export interface Index {
    id: IndexId;
    name: string;
    assets: Asset[];
    historyOverview: HistoryOverview;
    startTime: number | null;
}

export enum MomentFormat {
    DATE = "YYYY-MM-DD",
    DATE_TIME = "YYYY-MM-DD HH:mm",
}
