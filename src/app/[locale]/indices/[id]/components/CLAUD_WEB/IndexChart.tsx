"use client";
import {useState, useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps} from "recharts";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Index} from "@/utils/types/general.types";
import {COLORS} from "@/utils/constants/general.constants";
import moment from "moment";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {renderSafelyPercentage} from "@/utils/heleprs/ui/formatPercentage.helper";
import {NumeralFormat} from "@numeral";
import {useLocale, useTranslations} from "next-intl";

interface IndexChartProps {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export function IndexChart({index}: IndexChartProps) {
    const locale = useLocale();

    const {history, id} = index;
    const [selectedRange, setSelectedRange] = useState("1M");

    const tIndex = useTranslations("index");

    const timeRanges = [
        {value: "7D", days: 7, label: tIndex("chart.timeRanges.7d")},
        {value: "1M", days: 30, label: tIndex("chart.timeRanges.1m")},
        {value: "3M", days: 90, label: tIndex("chart.timeRanges.3m")},
        {value: "6M", days: 180, label: tIndex("chart.timeRanges.6m")},
        {value: "YTD", days: "ytd", label: tIndex("chart.timeRanges.ytd")},
        {value: "1Y", days: 365, label: tIndex("chart.timeRanges.1y")},
        {value: "All", days: null, label: tIndex("chart.timeRanges.all")},
    ];

    const getFilteredData = () => {
        const range = timeRanges.find(r => r.value === selectedRange);
        if (!range || !range.days) return history;

        if (range.days === "ytd") {
            // Year to Date - from January 1st of current year
            const currentYear = moment.utc().year();
            const startOfYear = moment.utc().year(currentYear).startOf("year");
            const startOfYearTimestamp = startOfYear.valueOf();

            return history.filter(item => item.time >= startOfYearTimestamp);
        }

        return history.slice((-range?.days as number) - 1);
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
    }, [JSON.stringify(filteredData)]);

    const formatDate = (timestamp: number | string) => {
        const date = moment.utc(timestamp).toDate();
        const isYTDRange = selectedRange === "YTD";

        return date.toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
            year: selectedRange === "All" || selectedRange === "1Y" || isYTDRange ? "numeric" : undefined,
        });
    };

    const formatTooltipDate = (timestamp: number) => {
        const date = moment.utc(timestamp).toDate();
        return date.toLocaleDateString(locale, {
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

            const timestamp = parseInt(label);
            const change =
                filteredData.length > 1
                    ? ((value - Number(filteredData[0].priceUsd)) / Number(filteredData[0].priceUsd)) * 100
                    : 0;

            return (
                <div className="bg-white p-3 sm:p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <div className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        {formatTooltipDate(timestamp)}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-500">
                                {tIndex("chart.tooltip.indexValue")}:
                            </span>
                            <span className="font-medium text-sm sm:text-base">${renderSafelyNumber(value)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-500">{tIndex("chart.tooltip.change")}:</span>
                            <span
                                className={`font-medium text-sm sm:text-base ${change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {renderSafelyPercentage(change)}
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

    // Determine gradient colors based on performance
    const isPositive = performance >= 0;
    const gradientId = `areaGradient-${id}`;

    const currentRange = timeRanges.find(range => range.value === selectedRange);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Title and Performance */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <CardTitle className="text-lg sm:text-xl">{tIndex("chart.priceChart")}</CardTitle>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-xl sm:text-2xl font-bold">${renderSafelyNumber(currentValue)}</div>
                            <div
                                className={`text-sm font-medium ${performance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {renderSafelyPercentage(performance)} ({currentRange?.label ?? selectedRange})
                            </div>
                        </div>
                    </div>

                    {/* Time Range Buttons */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end">
                        {/* Mobile: Compact buttons */}
                        <div className="flex flex-1  sm:hidden flex-wrap gap-1">
                            {timeRanges.map(range => (
                                <Button
                                    key={range.value}
                                    variant={selectedRange === range.value ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-2 text-xs flex-1 min-w-0"
                                    onClick={() => setSelectedRange(range.value)}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>

                        {/* Desktop: Normal buttons */}
                        <div className="hidden sm:flex flex-wrap gap-1">
                            {timeRanges.map(range => (
                                <Button
                                    key={range.value}
                                    variant={selectedRange === range.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedRange(range.value)}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {/* Chart Container with Responsive Height */}
                <div className="h-64 sm:h-80 lg:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{top: 5, right: 5, left: 5, bottom: 5}}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={isPositive ? COLORS.positive : COLORS.negative}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={isPositive ? COLORS.positive : COLORS.negative}
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatDate}
                                stroke="#666"
                                fontSize={10}
                                className="sm:text-xs"
                                tick={{fontSize: 10}}
                            />
                            <YAxis
                                domain={yAxisDomain}
                                stroke="#666"
                                fontSize={10}
                                className="sm:text-xs"
                                tick={{fontSize: 10}}
                                tickFormatter={value => `$${renderSafelyNumber(value, NumeralFormat.INTEGER)}`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? COLORS.positive : COLORS.negative}
                                strokeWidth={2}
                                fill={`url(#${gradientId})`}
                                activeDot={{
                                    r: 4,
                                    stroke: isPositive ? COLORS.positive : COLORS.negative,
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
