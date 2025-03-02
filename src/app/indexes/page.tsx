import IndexesTable from "@/app/indexes/IndexesTable";
import {
    getAssetHistoryOverview,
    getIndexHistory,
    getIndexHistoryOverview,
    getTopAssets,
} from "@/app/api/assets/db.helpers";
import {Index, IndexId} from "@/utils/types/general.types";

export default async function IndexesPage() {
    const top5Assets = await getTopAssets(5);
    const top10Assets = await getTopAssets(10);
    const top30Assets = await getTopAssets(30);
    const top50Assets = await getTopAssets(50);

    const top5Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_5,
        name: "Index 5",
        assets: top5Assets,
        history: [],
    };

    const top10Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_10,
        name: "Index 10",
        assets: top10Assets,
        history: [],
    };

    const top30Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_30,
        name: "Index 30",
        assets: top30Assets,
        history: [],
    };

    const top50Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_50,
        name: "Index 50",
        assets: top50Assets,
        history: [],
    };

    const {historyOverview: top5HistoryOverview, startTime: top5StartTime} = await getIndexHistoryOverview(top5Index);

    const {historyOverview: top10HistoryOverview, startTime: top10StartTime} =
        await getIndexHistoryOverview(top10Index);

    const {historyOverview: top30HistoryOverview, startTime: top30StartTime} =
        await getIndexHistoryOverview(top30Index);

    const {historyOverview: top50HistoryOverview, startTime: top50StartTime} =
        await getIndexHistoryOverview(top50Index);

    const data: Index[] = [
        {
            ...top5Index,
            historyOverview: top5HistoryOverview,
            startTime: top5StartTime,
            history: await getIndexHistory(top5Index),
        },
        {
            ...top10Index,
            historyOverview: top10HistoryOverview,
            startTime: top10StartTime,
            history: await getIndexHistory(top10Index),
        },
        {
            ...top30Index,
            historyOverview: top30HistoryOverview,
            startTime: top30StartTime,
            history: await getIndexHistory(top30Index),
        },
        {
            ...top50Index,
            historyOverview: top50HistoryOverview,
            startTime: top50StartTime,
            history: await getIndexHistory(top50Index),
        },
    ];

    return <IndexesTable data={data} />;
}
