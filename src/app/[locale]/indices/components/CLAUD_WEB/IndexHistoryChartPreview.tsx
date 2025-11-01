"use client";
import {IndexOverviewWithHistory} from "@/utils/types/general.types";
import {isEmpty} from "lodash";
import {ChartPreview} from "@/app/[locale]/indices/components/CLAUD_WEB/ChartPreview";
import {useTranslations} from "next-intl";
import ContentLoader from "@/components/Suspense/ContentLoader";
import * as React from "react";

export function IndexHistoryChartPreview({
    indexOverview,
    className,
    isLoading,
}: {
    isLoading: boolean;
    indexOverview?: IndexOverviewWithHistory;
    className?: string;
}) {
    const t = useTranslations("common");

    if (isLoading) return <ContentLoader type="chartPreview" count={1} />;

    if (isEmpty(indexOverview?.history)) {
        return <div className="flex items-center justify-center h-32 text-gray-500">{t("noDataAvailable")}</div>;
    }
    return <ChartPreview data={indexOverview?.history ?? []} className={className} />;
}
