"use client";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {TrendingUp, TrendingDown, BarChart3, Calendar, Copy, Edit, Trash2, ChevronUp, ChevronDown} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Index} from "@/utils/types/general.types";
import {getIndexDurationLabel} from "@/app/[locale]/indices/helpers";
import {UseIndexActionsReturns} from "@/app/[locale]/indices/[id]/hooks/useIndexActions.hook";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {useState} from "react";
import {renderSafelyPercentage} from "@/utils/heleprs/ui/formatPercentage.helper";
import {sortIndexAssetsByPortion} from "@/utils/heleprs/index/index.helpers";
import {useTranslations} from "next-intl";

interface IndexOverviewProps {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown>;
    currentUserId?: string;
    onEditAction?: UseIndexActionsReturns["onEdit"];
    onDeleteAction?: UseIndexActionsReturns["onDeleteClick"];
    onCloneAction?: UseIndexActionsReturns["onClone"];
}

export function IndexOverview({index, currentUserId, onEditAction, onDeleteAction, onCloneAction}: IndexOverviewProps) {
    const isUserIndex = !!index.userId && index.userId === currentUserId;

    const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);

    const tDuration = useTranslations("indices.duration");
    const tIndex = useTranslations("index");
    const tCommon = useTranslations("common");

    const getDuration = () => {
        if (!index.startTime || !index.endTime) return tCommon("noDataAvailable");
        return getIndexDurationLabel(index.startTime, index.endTime, tDuration);
    };

    const performanceMetrics = [
        {
            icon: TrendingUp,
            label: tIndex("overview.performance.24h.short"),
            fullLabel: tIndex("overview.performance.24h.full"),
            value: renderSafelyPercentage(index.historyOverview.days1),
        },
        {
            icon: TrendingUp,
            label: tIndex("overview.performance.7d.short"),
            fullLabel: tIndex("overview.performance.7d.full"),
            value: renderSafelyPercentage(index.historyOverview.days7),
        },
        {
            icon: TrendingUp,
            label: tIndex("overview.performance.30d.short"),
            fullLabel: tIndex("overview.performance.30d.full"),
            value: renderSafelyPercentage(index.historyOverview.days30),
        },
        {
            icon: BarChart3,
            label: tIndex("overview.performance.total.short"),
            fullLabel: tIndex("overview.performance.total.full"),
            value: renderSafelyPercentage(index.historyOverview.total),
        },
        {
            icon: TrendingDown,
            label: tIndex("overview.performance.maxDrawdown.short"),
            fullLabel: tIndex("overview.performance.maxDrawdown.full"),
            value: renderSafelyPercentage(-index.maxDrawDown.value),
        },
        {
            icon: Calendar,
            label: tIndex("overview.performance.duration.short"),
            fullLabel: tIndex("overview.performance.duration.full"),
            value: getDuration(),
        },
    ];

    const sortedAssetsByPortion = sortIndexAssetsByPortion(index.assets);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Title and Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <CardTitle className="text-xl sm:text-2xl leading-tight break-words">{index.name}</CardTitle>
                        <Badge variant={isUserIndex ? "default" : "secondary"} className="w-fit">
                            {isUserIndex
                                ? tIndex("overview.badges.customIndex")
                                : tIndex("overview.badges.systemIndex")}
                        </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => onCloneAction?.(index)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {tIndex("overview.actions.clone")}
                            </Button>
                            {isUserIndex && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => onEditAction?.(index)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {tIndex("overview.actions.edit")}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onDeleteAction?.(index)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {tIndex("overview.actions.delete")}
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Actions - Dropdown */}
                        <div className="sm:hidden flex flex-1">
                            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => onCloneAction?.(index)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    {tIndex("overview.actions.clone")}
                                </Button>
                                {isUserIndex && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => onEditAction?.(index)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            {tIndex("overview.actions.edit")}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => onDeleteAction?.(index)}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {tIndex("overview.actions.delete")}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                    {performanceMetrics.map((metric, index) => (
                        <div key={index} className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                <metric.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span className="sm:hidden">{metric.label}</span>
                                <span className="hidden sm:inline">{metric.fullLabel}</span>
                            </div>
                            <div className="text-sm sm:text-lg font-semibold leading-tight">{metric.value}</div>
                        </div>
                    ))}
                </div>

                {/* Assets Overview */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 sm:mb-3">
                        {tIndex("overview.assets.title", {count: sortedAssetsByPortion.length})}
                    </h3>

                    {/* Mobile: Vertical Stack */}
                    <div className="sm:hidden space-y-2">
                        {(() => {
                            const visibleAssets = isAssetsExpanded
                                ? sortedAssetsByPortion
                                : sortedAssetsByPortion.slice(0, 5);
                            const hasMoreAssets = sortedAssetsByPortion.length > 5;

                            return (
                                <>
                                    {visibleAssets.map(asset => (
                                        <div
                                            key={asset.id}
                                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                        >
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {asset.symbol}
                                            </Badge>
                                            <span className="text-sm text-gray-600 font-medium">
                                                {renderSafelyNumber(asset?.portion, NumeralFormat.INTEGER)}%
                                            </span>
                                        </div>
                                    ))}

                                    {hasMoreAssets && (
                                        <div className="flex justify-center pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
                                                className="text-xs text-gray-500 hover:text-gray-700"
                                            >
                                                {isAssetsExpanded ? (
                                                    <>
                                                        {tIndex("overview.assets.showLess")}
                                                        <ChevronUp className="ml-1 h-3 w-3" />
                                                    </>
                                                ) : (
                                                    <>
                                                        {tIndex("overview.assets.showMore", {
                                                            count: sortedAssetsByPortion.length - 5,
                                                        })}
                                                        <ChevronDown className="ml-1 h-3 w-3" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Desktop: Horizontal Wrap */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {sortedAssetsByPortion.map(asset => (
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
