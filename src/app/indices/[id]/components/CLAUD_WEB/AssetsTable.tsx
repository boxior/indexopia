"use client";

import {useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowUpDown, ArrowUp, ArrowDown, ExternalLink} from "lucide-react";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown} from "@/utils/types/general.types";
import * as React from "react";
import {LinkReferer} from "@/app/components/LinkReferer";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {formatPercentage} from "@/utils/heleprs/ui/formatPercentage.helper";
import {HISTORY_OVERVIEW_DAYS} from "@/utils/constants/general.constants";
import {ChartPreview} from "@/app/indices/components/CLAUD_WEB/ChartPreview";

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
                                <TableHead>30d Chart</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("days7")}
                                    >
                                        7d
                                        {getSortIcon("days7")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("days30")}
                                    >
                                        30d
                                        {getSortIcon("days30")}
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
                                        onClick={() => handleSort("marketCapUsd")}
                                    >
                                        Market Cap
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
                                    {asset.explorer && (
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <LinkReferer
                                                        href={asset.explorer}
                                                        view={"secondary"}
                                                        children={`${asset.name} (${asset.symbol})`}
                                                        target={"_blank"}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}

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
                                            data={asset.history.slice(-HISTORY_OVERVIEW_DAYS)}
                                            className={"w-32 h-16 relative"}
                                        />
                                    </TableCell>
                                    <TableCell>{formatPercentage(asset.historyOverview.days7)}</TableCell>
                                    <TableCell>{formatPercentage(asset.historyOverview.days30)}</TableCell>
                                    <TableCell>{formatPercentage(asset.historyOverview.total)}</TableCell>
                                    <TableCell>
                                        <span className="text-red-600">
                                            -{Math.abs(asset.maxDrawDown.value).toFixed(2)}%
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
            </CardContent>
        </Card>
    );
}
