"use client";
import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {
    Copy,
    Edit,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    ChevronRight,
    EyeOff,
    Eye,
} from "lucide-react";
import {EntityMode, Id, IndexOverview, IndexOverviewWithHistory} from "@/utils/types/general.types";
import {IndicesPagination} from "@/app/[locale]/indices/components/CLAUD_WEB/IndicesPagination";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {getIndexDurationLabel} from "@/app/[locale]/indices/helpers";
import Link from "next/link";
import * as React from "react";
import {IndexHistoryChartPreview} from "@/app/[locale]/indices/components/CLAUD_WEB/IndexHistoryChartPreview";
import {HISTORY_OVERVIEW_DAYS, PAGES_URLS} from "@/utils/constants/general.constants";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {LinkReferer} from "@/app/components/LinkReferer";
import {renderSafelyPercentage} from "@/utils/heleprs/ui/formatPercentage.helper";
import {useTranslations} from "next-intl";
import useSWR from "swr";
import {isEmpty} from "lodash";
import {fetcher} from "@/lib/fetcher";

interface IndicesTableProps {
    indices: IndexOverview[];
    mode?: EntityMode;
    onEditAction?: (index: IndexOverviewWithHistory) => void;
    onDeleteAction?: (index: IndexOverviewWithHistory) => void;
    onCloneAction?: (index: IndexOverviewWithHistory) => void;
}

type SortField = "name" | "total" | "days7" | "days30" | "maxDrawDown";
type SortOrder = "asc" | "desc";

type IndexWithOnlyHistory = Pick<IndexOverviewWithHistory, "id" | "history">;

export function IndicesTable({indices, onEditAction, onDeleteAction, onCloneAction, mode}: IndicesTableProps) {
    const router = useRouter();

    const [sortField, setSortField] = useState<SortField>("total");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [expandedRows, setExpandedRows] = useState<Set<Id>>(new Set());

    const doFetch = !isEmpty(indices);
    const {data: indicesWithOnlyHistoryData, isLoading: isLoadingIndicesWithHistory} = useSWR<{
        indices: IndexWithOnlyHistory[];
    }>(doFetch ? () => `/api/indices?ids=${indices.map(index => index.id).join(",")}` : null, fetcher);

    const indicesWithOnlyHistory = indicesWithOnlyHistoryData?.indices ?? [];

    const {data: sessionData} = useSession();
    const currentUserId = sessionData?.user?.id;

    const isViewMode = mode === EntityMode.VIEW;
    const hiddenOption = isViewMode && !currentUserId;

    // i18n
    const tTable = useTranslations("indices.table");
    const tDuration = useTranslations("indices.duration");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const handleSort = (field: SortField) => {
        if (isViewMode) return;

        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };

    const getSortIcon = (field: SortField) => {
        if (isViewMode) return null;

        if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;

        return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const sortedIndices = useMemo(() => {
        return [...indices].sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortField) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "total":
                    aValue = a.historyOverview.total;
                    bValue = b.historyOverview.total;
                    break;
                case "days7":
                    aValue = a.historyOverview.days7;
                    bValue = b.historyOverview.days7;
                    break;
                case "days30":
                    aValue = a.historyOverview.days30;
                    bValue = b.historyOverview.days30;
                    break;
                case "maxDrawDown":
                    aValue = a.maxDrawDown.value;
                    bValue = b.maxDrawDown.value;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }
            if (sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }, [indices, sortField, sortOrder]);

    // Paginated data
    const paginatedIndices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedIndices.slice(startIndex, endIndex);
    }, [sortedIndices, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const toggleRowExpansion = (indexId: Id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(indexId)) {
            newExpanded.delete(indexId);
        } else {
            newExpanded.add(indexId);
        }
        setExpandedRows(newExpanded);
    };

    const isUserIndex = (index: IndexOverview) => !!index.userId;

    const handleSignInClick = () => {
        router.push(PAGES_URLS.authSignIn);
    };

    // Overlay component for protected cells
    const ProtectedOverlay = () => (
        <div
            className="absolute inset-0 bg-gray-300 rounded flex items-center justify-center cursor-pointer transition-colors z-10 group"
            onClick={handleSignInClick}
        >
            <EyeOff className="h-4 w-4 text-gray-500 group-hover:hidden" />
            <Eye className="h-4 w-4 text-gray-500 hidden group-hover:block" />
        </div>
    );

    // Mobile Card Component
    const MobileIndexCard = ({index}: {index: IndexOverview}) => {
        const isExpanded = expandedRows.has(index.id);

        const indexWithOnlyHistory = indicesWithOnlyHistory.find(i => i.id === index.id);
        const indexWithHistory = {...index, ...indexWithOnlyHistory} as IndexOverviewWithHistory;

        return (
            <div
                className={`border rounded-lg p-4 mb-4 ${
                    isUserIndex(index) ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
            >
                {/* Main row - always visible */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <Link
                            className={`block font-semibold text-sm truncate ${
                                isUserIndex(index)
                                    ? "text-primary hover:text-primary/80"
                                    : "text-blue-600 hover:text-blue-800"
                            }`}
                            href={PAGES_URLS.index(index.id)}
                        >
                            {index.name}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {index.assets.slice(0, 2).map(asset => (
                                <Badge key={asset.id} variant="outline" className="text-xs">
                                    {asset.symbol}
                                </Badge>
                            ))}
                            {index.assets.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{index.assets.length - 2}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <div className="text-right relative">
                            <div className="text-sm font-medium">
                                {renderSafelyPercentage(index.historyOverview.total)}
                            </div>
                            <div className="text-xs text-gray-500">{tTable("labels.total")}</div>
                            {hiddenOption && <ProtectedOverlay />}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleRowExpansion(index.id)}
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                        {/* Chart Preview */}
                        <div className="mb-4 relative">
                            <IndexHistoryChartPreview
                                indexOverview={indexWithOnlyHistory ? indexWithHistory : undefined}
                                className="h-64"
                                isLoading={isLoadingIndicesWithHistory}
                            />
                            {hiddenOption && <ProtectedOverlay />}
                        </div>

                        {/* Performance metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {renderSafelyPercentage(index.historyOverview.days7)}
                                </div>
                                <div className="text-xs text-gray-500">{tTable("labels.days7Full")}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {renderSafelyPercentage(index.historyOverview.days30)}
                                </div>
                                <div className="text-xs text-gray-500">{tTable("labels.days30Full")}</div>
                            </div>
                        </div>

                        {/* Additional metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center relative">
                                <div className="text-sm font-medium text-red-600">
                                    -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500">{tTable("labels.maxDrawDown")}</div>
                                {hiddenOption && <ProtectedOverlay />}
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium text-gray-600">
                                    {!!index.startTime && !!index.endTime
                                        ? getIndexDurationLabel(index.startTime, index.endTime, tDuration)
                                        : "-"}
                                </div>
                                <div className="text-xs text-gray-500">{tTable("labels.duration")}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isViewMode && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => indexWithHistory && onCloneAction?.(indexWithHistory)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tTable("tooltips.clone")}</p>
                                    </TooltipContent>
                                </Tooltip>

                                {isUserIndex(index) && index.userId === currentUserId && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => indexWithHistory && onEditAction?.(indexWithHistory)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{tTable("tooltips.edit")}</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                    onClick={() =>
                                                        indexWithHistory && onDeleteAction?.(indexWithHistory)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{tTable("tooltips.delete")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
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
                                        onClick={() => handleSort("name")}
                                    >
                                        {tTable("headers.name")}
                                        {getSortIcon("name")}
                                    </Button>
                                </TableHead>
                                <TableHead>{tTable("headers.assets")}</TableHead>
                                <TableHead>{tTable("headers.chart", {days: HISTORY_OVERVIEW_DAYS})}</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("days7")}
                                    >
                                        {tTable("headers.days7")}
                                        {getSortIcon("days7")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("days30")}
                                    >
                                        {tTable("headers.days30")}
                                        {getSortIcon("days30")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("total")}
                                    >
                                        {tTable("headers.total")}
                                        {getSortIcon("total")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => handleSort("maxDrawDown")}
                                    >
                                        {tTable("headers.maxDrawDown")}
                                        {getSortIcon("maxDrawDown")}
                                    </Button>
                                </TableHead>
                                <TableHead>{tTable("headers.duration")}</TableHead>
                                {!isViewMode && (
                                    <TableHead className="text-right">{tTable("headers.actions")}</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedIndices.map(index => {
                                const indexWithOnlyHistory = indicesWithOnlyHistory.find(i => i.id === index.id);
                                const indexWithHistory = {
                                    ...index,
                                    ...indexWithOnlyHistory,
                                } as IndexOverviewWithHistory;

                                return (
                                    <TableRow
                                        key={index.id}
                                        className={
                                            isUserIndex(index)
                                                ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                                                : ""
                                        }
                                    >
                                        <TableCell className={"font-medium"}>
                                            {hiddenOption ? (
                                                <span className="relative">
                                                    {index.name}
                                                    <span
                                                        className={
                                                            isUserIndex(index)
                                                                ? "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"
                                                                : "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 ease-out"
                                                        }
                                                    ></span>
                                                </span>
                                            ) : (
                                                <LinkReferer
                                                    href={PAGES_URLS.index(index.id)}
                                                    view={isUserIndex(index) ? "primary" : "secondary"}
                                                    children={index.name}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {index.assets.slice(0, 3).map(asset => (
                                                    <Badge key={asset.id} variant="outline" className="text-xs">
                                                        {asset.symbol}
                                                    </Badge>
                                                ))}
                                                {index.assets.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{index.assets.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-32 h-16 relative">
                                                <IndexHistoryChartPreview
                                                    indexOverview={indexWithHistory}
                                                    className="h-full border-0 p-0 bg-transparent"
                                                    isLoading={isLoadingIndicesWithHistory}
                                                />
                                                {hiddenOption && <ProtectedOverlay />}
                                            </div>
                                        </TableCell>
                                        <TableCell>{renderSafelyPercentage(index.historyOverview.days7)}</TableCell>
                                        <TableCell>{renderSafelyPercentage(index.historyOverview.days30)}</TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                {renderSafelyPercentage(index.historyOverview.total)}
                                                {hiddenOption && <ProtectedOverlay />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <span className="text-red-600">
                                                    -{renderSafelyNumber(index.maxDrawDown.value)}%
                                                </span>
                                                {hiddenOption && <ProtectedOverlay />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {!!index.startTime && !!index.endTime ? (
                                                <span className="text-sm text-gray-500">
                                                    {getIndexDurationLabel(index.startTime, index.endTime, tDuration)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-500">-</span>
                                            )}
                                        </TableCell>
                                        {!isViewMode && (
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    indexWithHistory &&
                                                                    onCloneAction?.(indexWithHistory)
                                                                }
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{tTable("tooltips.clone")}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {isUserIndex(index) && index.userId === currentUserId && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={() =>
                                                                            indexWithHistory &&
                                                                            onEditAction?.(indexWithHistory)
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{tTable("tooltips.edit")}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                        onClick={() =>
                                                                            indexWithHistory &&
                                                                            onDeleteAction?.(indexWithHistory)
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{tTable("tooltips.delete")}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
                <div className="space-y-4">
                    {paginatedIndices.map(index => (
                        <MobileIndexCard key={index.id} index={index} />
                    ))}
                </div>
            </div>

            {!isViewMode && (
                <>
                    <IndicesPagination
                        currentPage={currentPage}
                        totalItems={sortedIndices.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </>
            )}
        </>
    );
}
