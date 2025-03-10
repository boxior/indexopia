"use client";

import {Area, AreaChart, CartesianGrid} from "recharts";

import {ChartConfig, ChartContainer, ChartTooltip} from "@/components/ui/chart";
import moment from "moment";
import {ChartData, Index, MomentFormat} from "@/utils/types/general.types";
import {IndexPreviewAreaChartTooltip} from "@/app/indexes/indexPreviewAreaChartTooltip";
import {getChartColor} from "@/app/indexes/helpers";

export function IndexPreviewAreaChart({index}: {index: Index}) {
    const chartData: ChartData[] = index.history.slice(-7).map(item => ({
        date: moment(item.time).format(MomentFormat.DAY_FULL),
        price: parseFloat(item.priceUsd),
    }));

    const chartConfig = {
        price: {
            color: getChartColor(chartData[chartData.length - 1].price - chartData[0].price),
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <ChartTooltip cursor={false} content={<IndexPreviewAreaChartTooltip />} />
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
