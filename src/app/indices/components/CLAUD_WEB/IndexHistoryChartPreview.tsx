"use client";
import {IndexOverviewWithHistory} from "@/utils/types/general.types";
import {isEmpty} from "lodash";
import {ChartPreview} from "@/app/indices/components/CLAUD_WEB/ChartPreview";

export function IndexHistoryChartPreview({
    indexOverview,
    className,
}: {
    indexOverview: IndexOverviewWithHistory;
    className?: string;
}) {
    if (isEmpty(indexOverview.history)) {
        return <div className="flex items-center justify-center h-32 text-gray-500">No data available</div>;
    }
    return <ChartPreview data={indexOverview.history} className={className} />;
}
