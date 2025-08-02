"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {TrendingUp, TrendingDown, BarChart3, Calendar, Copy, Edit, Trash2} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Index} from "@/utils/types/general.types";
import {getIndexDurationLabel} from "@/app/indices/helpers";
import {UseIndexActionsReturns} from "@/app/indices/[id]/hooks/useIndexActions.hook";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";

interface IndexOverviewProps {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>;
    currentUserId?: string;
    onEditAction?: UseIndexActionsReturns["onEdit"];
    onDeleteAction?: UseIndexActionsReturns["onDeleteClick"];
    onCloneAction?: UseIndexActionsReturns["onClone"];
}

export function IndexOverview({index, currentUserId, onEditAction, onDeleteAction, onCloneAction}: IndexOverviewProps) {
    const isUserIndex = !!index.userId && index.userId === currentUserId;

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        const color = value >= 0 ? "text-green-600" : "text-red-600";
        return (
            <span className={color}>
                {sign}
                {value.toFixed(2)}%
            </span>
        );
    };

    const formatCurrency = (value: string) => {
        const num = parseFloat(value);
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const getDuration = () => {
        if (!index.startTime || !index.endTime) return "N/A";

        return getIndexDurationLabel(index.startTime, index.endTime);
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CardTitle className="text-2xl">{index.name}</CardTitle>
                        <Badge variant={isUserIndex ? "default" : "secondary"}>
                            {isUserIndex ? "Custom Index" : "System Index"}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onCloneAction?.(index)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                        </Button>
                        {isUserIndex && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => onEditAction?.(index)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onDeleteAction?.(index)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {/* Performance Metrics */}
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            24h Performance
                        </div>
                        <div className="text-lg font-semibold">{formatPercentage(index.historyOverview.days1)}</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            7d Performance
                        </div>
                        <div className="text-lg font-semibold">{formatPercentage(index.historyOverview.days7)}</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            30d Performance
                        </div>
                        <div className="text-lg font-semibold">{formatPercentage(index.historyOverview.days30)}</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Total Return
                        </div>
                        <div className="text-lg font-semibold">{formatPercentage(index.historyOverview.total)}</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Max Drawdown
                        </div>
                        <div className="text-lg font-semibold text-red-600">
                            -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Duration
                        </div>
                        <div className="text-lg font-semibold">{getDuration()}</div>
                    </div>
                </div>

                {/* Assets Overview */}
                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Assets ({index.assets.length})</h3>
                    <div className="flex flex-wrap gap-2">
                        {index.assets.map(asset => (
                            <div key={asset.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                                <Badge variant="outline" className="text-xs">
                                    {asset.symbol}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                    {renderSafelyNumber(asset?.portion, NumeralFormat.INTEGER)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
