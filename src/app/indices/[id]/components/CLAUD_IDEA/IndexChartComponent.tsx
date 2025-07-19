"use client";

import {useState, useMemo} from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Brush,
} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {IndexHistory} from "@/utils/types/general.types";
import {format, subDays, subMonths, subYears, isAfter, isBefore} from "date-fns";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {getChartColorClassname} from "@/app/indices/helpers";

interface IndexChartProps {
    history: IndexHistory[];
    title?: string;
}

type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y" | "all";
type ChartType = "line" | "candle";

const TIME_RANGES: {label: string; value: TimeRange}[] = [
    {label: "24H", value: "24h"},
    {label: "7D", value: "7d"},
    {label: "30D", value: "30d"},
    {label: "90D", value: "90d"},
    {label: "1Y", value: "1y"},
    {label: "ALL", value: "all"},
];

const CHART_TYPES: {label: string; value: ChartType}[] = [
    {label: "Line", value: "line"},
    {label: "Candle", value: "candle"},
];

export function IndexChart({history, title = "Price History"}: IndexChartProps) {
    const [selectedRange, setSelectedRange] = useState<TimeRange>("all");
    const [chartType, setChartType] = useState<ChartType>("line");
    const [customDateRange, setCustomDateRange] = useState<{
        start: string;
        end: string;
    }>({
        start: "",
        end: "",
    });

    const chartData = useMemo(() => {
        return history.map(item => ({
            date: item.date,
            price: parseFloat(item.priceUsd),
            time: item.time,
            formattedDate: format(new Date(item.date), "MMM dd, yyyy"),
            year: format(new Date(item.date), "yyyy"),
        }));
    }, [history]);

    const filteredData = useMemo(() => {
        if (!chartData.length) return [];

        const now = new Date();
        let startDate: Date;

        switch (selectedRange) {
            case "24h":
                startDate = subDays(now, 1);
                break;
            case "7d":
                startDate = subDays(now, 7);
                break;
            case "30d":
                startDate = subDays(now, 30);
                break;
            case "90d":
                startDate = subDays(now, 90);
                break;
            case "1y":
                startDate = subYears(now, 1);
                break;
            case "all":
            default:
                return chartData;
        }

        return chartData.filter(item => {
            const itemDate = new Date(item.date);
            return isAfter(itemDate, startDate) || itemDate.getTime() === startDate.getTime();
        });
    }, [chartData, selectedRange]);

    const customFilteredData = useMemo(() => {
        if (!customDateRange.start || !customDateRange.end) return filteredData;

        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);

        return filteredData.filter(item => {
            const itemDate = new Date(item.date);
            return (
                (isAfter(itemDate, startDate) || itemDate.getTime() === startDate.getTime()) &&
                (isBefore(itemDate, endDate) || itemDate.getTime() === endDate.getTime())
            );
        });
    }, [filteredData, customDateRange]);

    const finalData = customFilteredData;

    const getStrokeColor = () => {
        if (finalData.length < 2) return "#3b82f6";

        const firstPrice = finalData[0].price;
        const lastPrice = finalData[finalData.length - 1].price;

        return lastPrice >= firstPrice ? "#10b981" : "#ef4444";
    };

    const getYAxisDomain = () => {
        if (!finalData.length) return ["auto", "auto"];

        const prices = finalData.map(d => d.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.1;

        return [Math.max(0, min - padding), max + padding];
    };

    const formatYAxisTick = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        } else {
            return renderSafelyNumber(value, NumeralFormat.CURRENCY_$);
        }
    };

    const formatXAxisTick = (value: string) => {
        const date = new Date(value);

        if (selectedRange === "24h") {
            return format(date, "HH:mm");
        } else if (selectedRange === "7d" || selectedRange === "30d") {
            return format(date, "MMM dd");
        } else {
            return format(date, "yyyy");
        }
    };

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="background-foreground p-3 rounded-md shadow-md bg-white border">
                    <div className="text-sm text-gray-600 mb-1">{data.formattedDate}</div>
                    <div className={`font-semibold ${getChartColorClassname(data.price)}`}>
                        {renderSafelyNumber(data.price, NumeralFormat.CURRENCY_$)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{format(new Date(data.time), "HH:mm:ss")}</div>
                </div>
            );
        }
        return null;
    };

    const getXAxisInterval = () => {
        const dataLength = finalData.length;
        if (dataLength <= 50) return 0;
        if (dataLength <= 200) return Math.floor(dataLength / 10);
        return Math.floor(dataLength / 20);
    };

    const minDate = chartData.length ? format(new Date(chartData[0].date), "yyyy-MM-dd") : "";
    const maxDate = chartData.length ? format(new Date(chartData[chartData.length - 1].date), "yyyy-MM-dd") : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {finalData.length} data points
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Chart Type and Time Range Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Chart Type:</span>
                        <div className="flex gap-1">
                            {CHART_TYPES.map(type => (
                                <Button
                                    key={type.value}
                                    variant={chartType === type.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setChartType(type.value)}
                                    className="h-8 px-3"
                                >
                                    {type.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Range:</span>
                        <div className="flex gap-1">
                            {TIME_RANGES.map(range => (
                                <Button
                                    key={range.value}
                                    variant={selectedRange === range.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedRange(range.value)}
                                    className="h-8 px-3"
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Date Range Selector */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Custom Range:</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={customDateRange.start}
                            onChange={e => setCustomDateRange(prev => ({...prev, start: e.target.value}))}
                            min={minDate}
                            max={maxDate}
                            className="px-3 py-1 text-sm border rounded-md"
                        />
                        <span className="text-sm text-gray-500">to</span>
                        <input
                            type="date"
                            value={customDateRange.end}
                            onChange={e => setCustomDateRange(prev => ({...prev, end: e.target.value}))}
                            min={customDateRange.start || minDate}
                            max={maxDate}
                            className="px-3 py-1 text-sm border rounded-md"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCustomDateRange({start: "", end: ""})}
                            className="h-8 px-3"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={finalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxisTick}
                                stroke="#6b7280"
                                interval={getXAxisInterval()}
                                angle={selectedRange === "all" ? -45 : 0}
                                textAnchor={selectedRange === "all" ? "end" : "middle"}
                                height={selectedRange === "all" ? 60 : 30}
                            />
                            <YAxis tickFormatter={formatYAxisTick} stroke="#6b7280" domain={getYAxisDomain()} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke={getStrokeColor()}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 6, fill: getStrokeColor()}}
                            />

                            {/* Range Selector Brush */}
                            {selectedRange === "all" && finalData.length > 100 && (
                                <Brush
                                    dataKey="date"
                                    height={30}
                                    stroke={getStrokeColor()}
                                    tickFormatter={value => format(new Date(value), "yyyy")}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-xs text-gray-500">Current</div>
                        <div className="font-semibold">
                            {finalData.length
                                ? renderSafelyNumber(finalData[finalData.length - 1].price, NumeralFormat.CURRENCY_$)
                                : "-"}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">High</div>
                        <div className="font-semibold text-green-600">
                            {finalData.length
                                ? renderSafelyNumber(Math.max(...finalData.map(d => d.price)), NumeralFormat.CURRENCY_$)
                                : "-"}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">Low</div>
                        <div className="font-semibold text-red-600">
                            {finalData.length
                                ? renderSafelyNumber(Math.min(...finalData.map(d => d.price)), NumeralFormat.CURRENCY_$)
                                : "-"}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500">Change</div>
                        <div
                            className={`font-semibold ${finalData.length >= 2 ? getChartColorClassname(finalData[finalData.length - 1].price - finalData[0].price) : ""}`}
                        >
                            {finalData.length >= 2
                                ? renderSafelyNumber(
                                      ((finalData[finalData.length - 1].price - finalData[0].price) /
                                          finalData[0].price) *
                                          100,
                                      NumeralFormat.PERCENT
                                  )
                                : "-"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
