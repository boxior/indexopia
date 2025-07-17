"use client";

import {useMemo} from "react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {IndexHistory} from "@/utils/types/general.types";
import {format} from "date-fns";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {getChartColorClassname} from "@/app/indices/helpers";

interface IndexChartProps {
    history: IndexHistory[];
    title?: string;
}

export function IndexChart({history, title = "Price History"}: IndexChartProps) {
    const chartData = useMemo(() => {
        return history.map(item => ({
            date: item.date,
            price: parseFloat(item.priceUsd),
            time: item.time,
            formattedDate: format(new Date(item.date), "MMM dd, yyyy"),
        }));
    }, [history]);

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="background-foreground p-2 rounded-md shadow-md bg-white">
                    <div className="capitalize text-black opacity-50">{data.formattedDate}</div>
                    <div className={`capitalize ${getChartColorClassname(data.price)}`}>
                        {renderSafelyNumber(data.price, NumeralFormat.CURRENCY_$)}
                    </div>
                </div>
            );
        }
        return null;
    };

    const getStrokeColor = () => {
        if (chartData.length < 2) return "#3b82f6";

        const firstPrice = chartData[0].price;
        const lastPrice = chartData[chartData.length - 1].price;

        return lastPrice >= firstPrice ? "#10b981" : "#ef4444";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={value => format(new Date(value), "MMM dd")}
                                stroke="#6b7280"
                            />
                            <YAxis
                                tickFormatter={value => renderSafelyNumber(value, NumeralFormat.CURRENCY_$)}
                                stroke="#6b7280"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke={getStrokeColor()}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{r: 6, fill: getStrokeColor()}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
