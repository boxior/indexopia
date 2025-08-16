"use client";
import {IndexOverviewWithHistory} from "@/utils/types/general.types";
import {isEmpty} from "lodash";
import {ChartPreview} from "@/app/indices/components/CLAUD_WEB/ChartPreview";
import {useTranslation} from "react-i18next";

export function IndexHistoryChartPreview({
    indexOverview,
    className,
}: {
    indexOverview: IndexOverviewWithHistory;
    className?: string;
}) {
    const {t} = useTranslation();

    if (isEmpty(indexOverview.history)) {
        return <div className="flex items-center justify-center h-32 text-gray-500">{t("common.noDataAvailable")}</div>;
    }
    return <ChartPreview data={indexOverview.history} className={className} />;
}
