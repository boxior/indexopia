import React from "react";
import {LineChart, Line, ResponsiveContainer, Tooltip} from "recharts";

export type IndexHistory = {
    priceUsd: string;
    time: number;
    date: string;
};

interface IndexChartPreviewProps {
    data: IndexHistory[];
    className?: string;
}

export function ChartPreview({data, className = ""}: IndexChartPreviewProps) {
    // Transform and prepare data for the chart
    const chartData = React.useMemo(() => {
        if (!data || data.length === 0) return [];

        return data
            .map(item => ({
                time: item.time,
                price: parseFloat(item.priceUsd),
                date: item.date,
                formattedDate: new Date(item.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }),
            }))
            .sort((a, b) => a.time - b.time); // Ensure chronological order
    }, [JSON.stringify(data)]);

    // Custom tooltip component
    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium text-gray-900">${data.price.toFixed(4)}</p>
                    <p className="text-gray-600 text-xs">{data.formattedDate}</p>
                </div>
            );
        }
        return null;
    };

    // Determine trend direction and color
    const {trendColor, isPositiveTrend} = React.useMemo(() => {
        if (chartData.length < 2) {
            return {trendColor: "#6b7280", isPositiveTrend: true}; // neutral gray
        }

        const firstPrice = chartData[0].price;
        const lastPrice = chartData[chartData.length - 1].price;
        const isPositive = lastPrice >= firstPrice;

        return {
            trendColor: isPositive ? "#10b981" : "#ef4444", // green or red
            isPositiveTrend: isPositive,
        };
    }, [JSON.stringify(chartData)]);

    // Show placeholder if no data
    if (!chartData || chartData.length === 0) {
        return (
            <div className={`h-12 w-20 flex items-center justify-center text-gray-400 text-xs ${className}`}>
                No data
            </div>
        );
    }

    // Show single point if only one data point
    if (chartData.length === 1) {
        return (
            <div className={`h-12 w-20 flex items-center justify-center ${className}`}>
                <div className="w-2 h-2 rounded-full bg-gray-400" title={`$${chartData[0].price.toFixed(4)}`} />
            </div>
        );
    }

    return (
        <div className={`h-12 w-30 ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{stroke: trendColor, strokeWidth: 1, strokeDasharray: "3 3"}}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={trendColor}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{
                            r: 3,
                            fill: trendColor,
                            stroke: "#fff",
                            strokeWidth: 1,
                        }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
