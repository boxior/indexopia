"use client";

import {Area, AreaChart, CartesianGrid} from "recharts";

import {ChartConfig, ChartContainer, ChartTooltip} from "@/components/ui/chart";
import moment from "moment";
import {AssetHistory, ChartData, IndexHistory, MomentFormat} from "@/utils/types/general.types";
import {IndexPreviewChartTooltip} from "@/app/indices/components/ORIGINAL/indexPreviewChartTooltip";
import {getChartColor} from "@/app/indices/helpers";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";

export function HistoryOverviewChart({history}: {history: (AssetHistory | IndexHistory)[]}) {
    const chartData: ChartData[] = history.slice(-HISTORY_OVERVIEW_DAYS).map(item => ({
        date: moment(item.time).format(MomentFormat.DAY_FULL),
        price: parseFloat(item.priceUsd),
    }));

    const chartConfig = {
        price: {
            color: getChartColor(chartData[chartData.length - 1]?.price - chartData[0]?.price),
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig} className={"h-20"}>
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <ChartTooltip cursor={false} content={<IndexPreviewChartTooltip />} />
                <Area
                    dataKey="price"
                    type="natural"
                    fill="var(--color-price)"
                    fillOpacity={0.4}
                    stroke="var(--color-price)"
                />
            </AreaChart>
        </ChartContainer>
    );
}
