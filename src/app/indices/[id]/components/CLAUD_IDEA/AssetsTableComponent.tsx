"use client";

import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, ArrowUp, ArrowDown} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";
import {getChartColorClassname} from "@/app/indices/helpers";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";

interface AssetsTableProps {
    assets: AssetWithHistoryOverviewPortionAndMaxDrawDown[];
}

type SortField =
    | "rank"
    | "name"
    | "symbol"
    | "priceUsd"
    | "marketCapUsd"
    | "changePercent24Hr"
    | "portion"
    | "days1"
    | "days7"
    | "days30"
    | "total"
    | "maxDrawDown";
type SortOrder = "asc" | "desc";

export function AssetsTable({assets}: AssetsTableProps) {
    const [sortField, setSortField] = useState<SortField>("rank");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
        return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const sortedAssets = useMemo(() => {
        return [...assets].sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case "rank":
                    aValue = parseInt(a.rank);
                    bValue = parseInt(b.rank);
                    break;
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "symbol":
                    aValue = a.symbol.toLowerCase();
                    bValue = b.symbol.toLowerCase();
                    break;
                case "priceUsd":
                    aValue = parseFloat(a.priceUsd);
                    bValue = parseFloat(b.priceUsd);
                    break;
                case "marketCapUsd":
                    aValue = parseFloat(a.marketCapUsd);
                    bValue = parseFloat(b.marketCapUsd);
                    break;
                case "changePercent24Hr":
                    aValue = parseFloat(a.changePercent24Hr);
                    bValue = parseFloat(b.changePercent24Hr);
                    break;
                case "portion":
                    aValue = a.portion;
                    bValue = b.portion;
                    break;
                case "days1":
                    aValue = a.historyOverview.days1;
                    bValue = b.historyOverview.days1;
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
                default:
                    aValue = parseInt(a.rank);
                    bValue = parseInt(b.rank);
            }

            if (sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }, [assets, sortField, sortOrder]);

    const formatPrice = (price: string) => {
        const numPrice = parseFloat(price);
        return renderSafelyNumber(numPrice, NumeralFormat.CURRENCY_$);
    };

    const formatMarketCap = (marketCap: string) => {
        const numMarketCap = parseFloat(marketCap);
        if (numMarketCap >= 1e12) {
            return `$${(numMarketCap / 1e12).toFixed(2)}T`;
        } else if (numMarketCap >= 1e9) {
            return `$${(numMarketCap / 1e9).toFixed(2)}B`;
        } else if (numMarketCap >= 1e6) {
            return `$${(numMarketCap / 1e6).toFixed(2)}M`;
        } else {
            return renderSafelyNumber(numMarketCap, NumeralFormat.CURRENCY_$);
        }
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        const color = getChartColorClassname(value);
        return (
            <span className={color}>
                {sign}
                {renderSafelyNumber(value, NumeralFormat.PERCENT)}
            </span>
        );
    };

    return (
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
                                Rank
                                {getSortIcon("rank")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("name")}
                            >
                                Name
                                {getSortIcon("name")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("symbol")}
                            >
                                Symbol
                                {getSortIcon("symbol")}
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
                                onClick={() => handleSort("days1")}
                            >
                                24h %{getSortIcon("days1")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("days7")}
                            >
                                7d %{getSortIcon("days7")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("days30")}
                            >
                                30d %{getSortIcon("days30")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("total")}
                            >
                                Total %{getSortIcon("total")}
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
                        <TableHead>
                            <Button
                                variant="ghost"
                                className="h-auto p-0 font-medium"
                                onClick={() => handleSort("portion")}
                            >
                                Portion
                                {getSortIcon("portion")}
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAssets.map(asset => (
                        <TableRow key={asset.id}>
                            <TableCell>{asset.rank}</TableCell>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-xs">
                                    {asset.symbol}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatPrice(asset.priceUsd)}</TableCell>
                            <TableCell>{formatMarketCap(asset.marketCapUsd)}</TableCell>
                            <TableCell>{formatPercentage(parseFloat(asset.changePercent24Hr))}</TableCell>
                            <TableCell>{formatPercentage(asset.historyOverview.days1)}</TableCell>
                            <TableCell>{formatPercentage(asset.historyOverview.days7)}</TableCell>
                            <TableCell>{formatPercentage(asset.historyOverview.days30)}</TableCell>
                            <TableCell>{formatPercentage(asset.historyOverview.total)}</TableCell>
                            <TableCell>
                                <span className="text-red-600">-{Math.abs(asset.maxDrawDown.value).toFixed(2)}%</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                    {(asset.portion * 100).toFixed(1)}%
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
