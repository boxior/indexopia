"use client";

import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";
import * as React from "react";
import {LinkReferer} from "@/app/components/LinkReferer";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {renderSafelyPercentage} from "@/utils/heleprs/ui/formatPercentage.helper";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {ChartPreview} from "@/app/[locale]/indices/components/CLAUD_WEB/ChartPreview";
import {useTranslations} from "next-intl";

interface AssetsTableProps {
    assets: AssetWithHistoryOverviewPortionAndMaxDrawDown[];
}

type SortField =
    | "name"
    | "portion"
    | "rank"
    | "priceUsd"
    | "days7"
    | "days30"
    | "total"
    | "maxDrawDown"
    | "marketCapUsd";
type SortOrder = "asc" | "desc";

export function AssetsTable({assets}: AssetsTableProps) {
    const [sortField, setSortField] = useState<SortField>("portion");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const tIndex = useTranslations("index");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const toggleRowExpansion = (assetId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(assetId)) {
            newExpanded.delete(assetId);
        } else {
            newExpanded.add(assetId);
        }
        setExpandedRows(newExpanded);
    };

    const sortedAssets = useMemo(() => {
        return assets.toSorted((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "portion":
                    aValue = a.portion;
                    bValue = b.portion;
                    break;
                case "rank":
                    aValue = parseInt(a.rank);
                    bValue = parseInt(b.rank);
                    break;
                case "priceUsd":
                    aValue = parseFloat(a.priceUsd);
                    bValue = parseFloat(b.priceUsd);
                    break;
                case "days7":
                    aValue = a.historyOverview.days7;
                    bValue = b.historyOverview.days7;
                    break;
                case "days30":
                    aValue = a.historyOverview.days30;
                    bValue = b.historyOverview.days30;
                    break;
                case "total":
                    aValue = a.historyOverview.total;
                    bValue = b.historyOverview.total;
                    break;
                case "maxDrawDown":
                    aValue = a.maxDrawDown.value;
                    bValue = b.maxDrawDown.value;
                    break;
                case "marketCapUsd":
                    aValue = parseFloat(a.marketCapUsd);
                    bValue = parseFloat(b.marketCapUsd);
                    break;
                default:
                    aValue = a.portion;
                    bValue = b.portion;
            }

            if (sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }, [assets, sortField, sortOrder]);
    // Mobile Card Component
    const MobileAssetCard = ({asset}: {asset: AssetWithHistoryOverviewPortionAndMaxDrawDown}) => {
        const isExpanded = expandedRows.has(asset.id);

        return (
            <div className="border rounded-lg p-4 mb-4">
                {/* Main row - always visible */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                                #{asset.rank}
                            </Badge>
                            <span className="font-semibold text-sm truncate">
                                {asset.name} ({asset.symbol})
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{renderSafelyNumber(asset.portion, NumeralFormat.INTEGER)}%</span>
                            <span>•</span>
                            <span>{renderSafelyNumber(asset.priceUsd, NumeralFormat.CURRENCY_$)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <div className="text-right">
                            <div className="text-sm font-medium">
                                {renderSafelyPercentage(asset.historyOverview.total)}
                            </div>
                            <div className="text-xs text-gray-500">{tIndex("assetsTable.mobile.total")}</div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleRowExpansion(asset.id)}
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                        {/* Chart Preview */}
                        <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-2">{tIndex("assetsTable.mobile.chart30d")}</div>
                            <ChartPreview
                                data={asset.history.slice(-HISTORY_OVERVIEW_DAYS - 1)}
                                className="w-full h-32"
                            />
                        </div>

                        {/* Performance metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {renderSafelyPercentage(asset.historyOverview.days7)}
                                </div>
                                <div className="text-xs text-gray-500">{tIndex("assetsTable.mobile.days7")}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {renderSafelyPercentage(asset.historyOverview.days30)}
                                </div>
                                <div className="text-xs text-gray-500">{tIndex("assetsTable.mobile.days30")}</div>
                            </div>
                        </div>

                        {/* Additional metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium text-red-600">
                                    -{Math.abs(asset.maxDrawDown.value).toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500">{tIndex("assetsTable.mobile.maxDrawdown")}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {(renderSafelyNumber(asset.marketCapUsd, NumeralFormat.HUGE) ?? "")
                                        .toString()
                                        .toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-500">{tIndex("assetsTable.mobile.marketCap")}</div>
                            </div>
                        </div>

                        {/* Explorer link if available */}
                        {asset.explorer && (
                            <div className="pt-2">
                                <LinkReferer
                                    href={asset.explorer}
                                    view="secondary"
                                    children={tIndex("assetsTable.mobile.viewOnExplorer")}
                                    target="_blank"
                                    className="text-sm"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{tIndex("assetsTable.title")}</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("rank")}
                                        >
                                            {tIndex("assetsTable.headers.rank")}
                                            {getSortIcon("rank")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("name")}
                                        >
                                            {tIndex("assetsTable.headers.asset")}
                                            {getSortIcon("name")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("portion")}
                                        >
                                            {tIndex("assetsTable.headers.allocation")}
                                            {getSortIcon("portion")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("priceUsd")}
                                        >
                                            {tIndex("assetsTable.headers.price")}
                                            {getSortIcon("priceUsd")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>{tIndex("assetsTable.headers.chart30d")}</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("days7")}
                                        >
                                            {tIndex("assetsTable.headers.days7")}
                                            {getSortIcon("days7")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("days30")}
                                        >
                                            {tIndex("assetsTable.headers.days30")}
                                            {getSortIcon("days30")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("total")}
                                        >
                                            {tIndex("assetsTable.headers.totalReturn")}
                                            {getSortIcon("total")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("maxDrawDown")}
                                        >
                                            {tIndex("assetsTable.headers.maxDrawdown")}
                                            {getSortIcon("maxDrawDown")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort("marketCapUsd")}
                                        >
                                            {tIndex("assetsTable.headers.marketCap")}
                                            {getSortIcon("marketCapUsd")}
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAssets.map(asset => (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <Badge variant="outline">#{asset.rank}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {asset.explorer ? (
                                                <LinkReferer
                                                    href={asset.explorer}
                                                    view="secondary"
                                                    children={`${asset.name} (${asset.symbol})`}
                                                    target="_blank"
                                                />
                                            ) : (
                                                <span>
                                                    {asset.name} ({asset.symbol})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {renderSafelyNumber(asset.portion, NumeralFormat.INTEGER)}%
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {renderSafelyNumber(asset.priceUsd, NumeralFormat.CURRENCY_$)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ChartPreview
                                                data={asset.history.slice(-HISTORY_OVERVIEW_DAYS - 1)}
                                                className="w-32 h-16 relative"
                                            />
                                        </TableCell>
                                        <TableCell>{renderSafelyPercentage(asset.historyOverview.days7)}</TableCell>
                                        <TableCell>{renderSafelyPercentage(asset.historyOverview.days30)}</TableCell>
                                        <TableCell>{renderSafelyPercentage(asset.historyOverview.total)}</TableCell>
                                        <TableCell>
                                            <span className="text-red-600">
                                                {renderSafelyPercentage(-asset.maxDrawDown.value)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {(renderSafelyNumber(asset.marketCapUsd, NumeralFormat.HUGE) ?? "")
                                                    .toString()
                                                    .toUpperCase()}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    <div className="space-y-4">
                        {sortedAssets.map(asset => (
                            <MobileAssetCard key={asset.id} asset={asset} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
