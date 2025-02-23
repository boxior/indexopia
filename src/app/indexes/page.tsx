import IndexesTable from "@/app/indexes/IndexesTable";
import {getAssetHistoryOverview, getIndexHistoryOverview, getTopAssets} from "@/app/api/assets/db.helpers";
import {Index, IndexId} from "@/utils/types/general.types";

export default async function IndexesPage() {
    const top5Assets = await getTopAssets(5);
    const top10Assets = await getTopAssets(10);
    const top30Assets = await getTopAssets(30);

    const top5Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_5,
        name: "Top 5",
        assets: top5Assets,
    };

    const top10Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_10,
        name: "Top 10",
        assets: top10Assets,
    };

    const top30Index: Omit<Index, "historyOverview" | "startTime"> = {
        id: IndexId.TOP_30,
        name: "Top 30",
        assets: top30Assets,
    };

    const {historyOverview: top5HistoryOverview, startTime: top5StartTime} = await getIndexHistoryOverview(top5Index);
    const {historyOverview: top10HistoryOverview, startTime: top10StartTime} =
        await getIndexHistoryOverview(top10Index);
    const {historyOverview: top30HistoryOverview, startTime: top30StartTime} =
        await getIndexHistoryOverview(top30Index);

    const data: Index[] = [
        {...top5Index, historyOverview: top5HistoryOverview, startTime: top5StartTime},
        {...top10Index, historyOverview: top10HistoryOverview, startTime: top10StartTime},
        {...top30Index, historyOverview: top30HistoryOverview, startTime: top30StartTime},
    ];

    return <IndexesTable data={data} />;
}
