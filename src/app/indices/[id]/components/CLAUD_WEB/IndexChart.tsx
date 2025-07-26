"use client";
import {useState, useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps} from "recharts";
import {IndexHistory} from "@/utils/types/general.types";

interface IndexChartProps {
    history: IndexHistory[];
    indexName: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const timeRanges = [
    {label: "7D", days: 7},
    {label: "1M", days: 30},
    {label: "3M", days: 90},
    {label: "6M", days: 180},
    {label: "YTD", days: "ytd"},
    {label: "1Y", days: 365},
    {label: "All", days: null},
];

export function IndexChart({history, indexName}: IndexChartProps) {
    const [selectedRange, setSelectedRange] = useState("1M");

    const getFilteredData = () => {
        const range = timeRanges.find(r => r.label === selectedRange);
        if (!range || !range.days) return history;

        if (range.days === "ytd") {
            // Year to Date - from January 1st of current year
            const currentYear = new Date().getFullYear();
            const startOfYear = new Date(currentYear, 0, 1); // January 1st
            const startOfYearTimestamp = startOfYear.getTime();

            return history.filter(item => item.time >= startOfYearTimestamp);
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (range.days as number));
        const cutoffTimestamp = cutoffDate.getTime();

        return history.filter(item => item.time >= cutoffTimestamp);
    };

    const filteredData = getFilteredData();

    // Calculate dynamic Y-axis domain
    const yAxisDomain = useMemo(() => {
        if (filteredData.length === 0) return [0, 100];

        const values = filteredData.map(item => Number(item.priceUsd));
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Add padding to the domain (5% on each side)
        const padding = (maxValue - minValue) * 0.05;
        const domainMin = Math.max(0, minValue - padding);
        const domainMax = maxValue + padding;

        return [domainMin, domainMax];
    }, [filteredData]);

    const formatDate = (timestamp: number | string) => {
        const date = new Date(timestamp);
        const isYTDRange = selectedRange === "YTD";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: selectedRange === "All" || selectedRange === "1Y" || isYTDRange ? "numeric" : undefined,
        });
    };

    const formatTooltipDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const CustomTooltip = ({active, payload, label}: CustomTooltipProps) => {
        if (active && payload && payload.length && label) {
            const value = payload[0].value;
            console.log("value", value);
            const timestamp = parseInt(label);
            const change =
                filteredData.length > 1
                    ? ((value - Number(filteredData[0].priceUsd)) / Number(filteredData[0].priceUsd)) * 100
                    : 0;

            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <div className="font-medium text-gray-900 mb-2">{formatTooltipDate(timestamp)}</div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Index Value:</span>
                            <span className="font-medium">${Number(value).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Change:</span>
                            <span className={`font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const chartData = filteredData.map(item => ({
        timestamp: item.time,
        value: item.priceUsd,
        date: formatDate(item.date),
    }));

    // Calculate performance for the selected period
    const currentValue = Number(filteredData[filteredData.length - 1]?.priceUsd) || 0;
    const initialValue = Number(filteredData[0]?.priceUsd) || 0;
    const performance = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Price Chart</CardTitle>
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="text-2xl font-bold">${currentValue.toFixed(2)}</div>
                            <div
                                className={`text-sm font-medium ${performance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {performance >= 0 ? "+" : ""}
                                {performance.toFixed(2)}% ({selectedRange})
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {timeRanges.map(range => (
                            <Button
                                key={range.label}
                                variant={selectedRange === range.label ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedRange(range.label)}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" fontSize={12} />
                            <YAxis
                                domain={yAxisDomain}
                                stroke="#666"
                                fontSize={12}
                                tickFormatter={value => `$${Number(value).toFixed(2)}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 4, stroke: "#3b82f6", strokeWidth: 2}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
