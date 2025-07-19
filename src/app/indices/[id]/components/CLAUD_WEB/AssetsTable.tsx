// components/index-detail/assets-table.tsx
"use client";

import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowUpDown, ArrowUp, ArrowDown, ExternalLink} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";

interface AssetsTableProps {
    assets: AssetWithHistoryOverviewPortionAndMaxDrawDown[];
}

type SortField =
    | "name"
    | "portion"
    | "rank"
    | "priceUsd"
    | "changePercent24Hr"
    | "marketCapUsd"
    | "days1"
    | "days7"
    | "total"
    | "maxDrawDown";
type SortOrder = "asc" | "desc";

export function AssetsTable({assets}: AssetsTableProps) {
    const [sortField, setSortField] = useState<SortField>("portion");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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

    const sortedAssets = [...assets].sort((a, b) => {
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
            case "changePercent24Hr":
                aValue = parseFloat(a.changePercent24Hr);
                bValue = parseFloat(b.changePercent24Hr);
                break;
            case "marketCapUsd":
                aValue = parseFloat(a.marketCapUsd);
                bValue = parseFloat(b.marketCapUsd);
                break;
            case "days1":
                aValue = a.historyOverview.days1;
                bValue = b.historyOverview.days1;
                break;
            case "days7":
                aValue = a.historyOverview.days7;
                bValue = b.historyOverview.days7;
                break;
            case "total":
                aValue = a.historyOverview.total;
                bValue = b.historyOverview.total;
                break;
            case "maxDrawDown":
                aValue = a.maxDrawDown.value;
                bValue = b.maxDrawDown.value;
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

    const formatPrice = (value: string) => {
        const num = parseFloat(value);
        if (num < 0.01) return `$${num.toFixed(6)}`;
        if (num < 1) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(2)}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Assets Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("name")}
                                    >
                                        Asset
                                        {getSortIcon("name")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("portion")}
                                    >
                                        Allocation
                                        {getSortIcon("portion")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("priceUsd")}
                                    >
                                        Price
                                        {getSortIcon("priceUsd")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("changePercent24Hr")}
                                    >
                                        24h Change
                                        {getSortIcon("changePercent24Hr")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("days7")}
                                    >
                                        7d Performance
                                        {getSortIcon("days7")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("total")}
                                    >
                                        Total Return
                                        {getSortIcon("total")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("marketCapUsd")}
                                    >
                                        Market Cap
                                        {getSortIcon("marketCapUsd")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("maxDrawDown")}
                                    >
                                        Max Drawdown
                                        {getSortIcon("maxDrawDown")}
                                    </Button>
                                </TableHead>
                                <TableHead>Explorer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAssets.map(asset => (
                                <TableRow key={asset.id}>
                                    <TableCell>
                                        <Badge variant="outline">#{asset.rank}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <div className="font-medium">{asset.symbol}</div>
                                                <div className="text-sm text-gray-500">{asset.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{asset.portion.toFixed(1)}%</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{formatPrice(asset.priceUsd)}</div>
                                    </TableCell>
                                    <TableCell>{formatPercentage(parseFloat(asset.changePercent24Hr))}</TableCell>
                                    <TableCell>{formatPercentage(asset.historyOverview.days7)}</TableCell>
                                    <TableCell>{formatPercentage(asset.historyOverview.total)}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{formatCurrency(asset.marketCapUsd)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-red-600">
                                            -{Math.abs(asset.maxDrawDown.value).toFixed(2)}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {asset.explorer && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a
                                                    href={asset.explorer}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
