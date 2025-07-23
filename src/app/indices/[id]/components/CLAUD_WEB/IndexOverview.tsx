// components/index-detail/index-overview.tsx
"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {TrendingUp, TrendingDown, BarChart3, Calendar, Copy, Edit, Trash2} from "lucide-react";
import {Index} from "@/utils/types/general.types";

interface IndexOverviewProps {
    index: Index;
    currentUserId?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onClone?: () => void;
}

export function IndexOverview({index, currentUserId, onEdit, onDelete, onClone}: IndexOverviewProps) {
    const isSystemIndex = !!index.systemId;
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
        const duration = index.endTime - index.startTime;
        const days = Math.floor(duration / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) {
            const remainingMonths = months % 12;
            return `${years}y ${remainingMonths}m`;
        }
        if (months > 0) {
            return `${months} months`;
        }
        return `${days} days`;
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CardTitle className="text-2xl">{index.name}</CardTitle>
                        <Badge variant={isSystemIndex ? "default" : "secondary"}>
                            {isSystemIndex ? "System Index" : "Custom Index"}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isSystemIndex && (
                            <Button variant="outline" size="sm" onClick={onClone}>
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                            </Button>
                        )}
                        {isUserIndex && (
                            <>
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={onDelete}>
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
                                <span className="text-sm text-gray-600">{asset?.portion?.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
