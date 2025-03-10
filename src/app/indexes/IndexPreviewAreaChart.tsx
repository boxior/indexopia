"use client";

import {TrendingUp} from "lucide-react";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import moment from "moment";
import {Index, MomentFormat} from "@/utils/types/general.types";

const chartConfig = {
    price: {
        label: "Price",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function IndexPreviewAreaChart({index}: {index: Index}) {
    const chartData = index.history.slice(-7).map(item => ({
        date: moment(item.time).format(MomentFormat.DAY_FULL),
        price: parseFloat(item.priceUsd),
    }));

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
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" className={"capitalize"} />}
                />
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
