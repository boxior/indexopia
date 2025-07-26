"use client";
import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from "@/components/ui/tooltip";
import {Copy, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight} from "lucide-react";
import {Id, IndexOverview} from "@/utils/types/general.types";
import {DeleteIndexConfirmModal} from "@/app/indices/components/CLAUD_WEB/DeleteIndexConfirmModal";
import {IndicesPagination} from "@/app/indices/components/CLAUD_WEB/IndicesPagination";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";
import {getIndexDurationLabel} from "@/app/indices/helpers";
import Link from "next/link";
import * as React from "react";

interface IndicesTableProps {
    indices: IndexOverview[];
    onEditAction: (index: IndexOverview) => void;
    onDeleteAction: (indexId: Id) => Promise<void>;
    onCloneAction: (index: IndexOverview) => void;
    currentUserId?: string;
}

type SortField = "name" | "total" | "days7" | "days30" | "maxDrawDown";
type SortOrder = "asc" | "desc";

export function IndicesTable({indices, onEditAction, onDeleteAction, onCloneAction, currentUserId}: IndicesTableProps) {
    const [sortField, setSortField] = useState<SortField>("total");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState<IndexOverview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<Id>>(new Set());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const handleSort = (field: SortField) => {
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

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        const color = value >= 0 ? "text-green-600" : "text-red-600";
        return (
            <span className={color}>
                {sign}
                {renderSafelyNumber(value)}%
            </span>
        );
    };

    const handleDeleteClick = (index: IndexOverview) => {
        setIndexToDelete(index);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (indexToDelete) {
                setIsDeleting(true);
                await onDeleteAction(indexToDelete.id);
                setDeleteModalOpen(false);
                setIndexToDelete(null);
            }
        } finally {
            setIsDeleting(false);
        }
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

    // Mobile Card Component
    const MobileIndexCard = ({index}: {index: IndexOverview}) => {
        const isExpanded = expandedRows.has(index.id);

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
                            href={`/indices/${index.id}`}
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
                        <div className="text-right">
                            <div className="text-sm font-medium">{formatPercentage(index.historyOverview.total)}</div>
                            <div className="text-xs text-gray-500">Total</div>
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
                        {/* Performance metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {formatPercentage(index.historyOverview.days7)}
                                </div>
                                <div className="text-xs text-gray-500">7 days</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    {formatPercentage(index.historyOverview.days30)}
                                </div>
                                <div className="text-xs text-gray-500">30 days</div>
                            </div>
                        </div>

                        {/* Additional metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm font-medium text-red-600">
                                    -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500">Max Drawdown</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium text-gray-600">
                                    {!!index.startTime && !!index.endTime
                                        ? getIndexDurationLabel(index.startTime, index.endTime)
                                        : "-"}
                                </div>
                                <div className="text-xs text-gray-500">Duration</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => onCloneAction(index)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clone index</p>
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
                                                onClick={() => onEditAction(index)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit index</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                onClick={() => handleDeleteClick(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete index</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <TooltipProvider>
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
                                        Index Name
                                        {getSortIcon("name")}
                                    </Button>
                                </TableHead>
                                <TableHead>Assets</TableHead>
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
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedIndices.map(index => (
                                <TableRow
                                    key={index.id}
                                    className={
                                        isUserIndex(index)
                                            ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                                            : ""
                                    }
                                >
                                    <TableCell className={"font-medium"}>
                                        <Link
                                            className={
                                                isUserIndex(index)
                                                    ? "group inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 font-semibold capitalize"
                                                    : "group inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold capitalize"
                                            }
                                            href={`/indices/${index.id}`}
                                        >
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
                                            <svg
                                                className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>
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
                                    <TableCell>{formatPercentage(index.historyOverview.days7)}</TableCell>
                                    <TableCell>{formatPercentage(index.historyOverview.days30)}</TableCell>
                                    <TableCell>{formatPercentage(index.historyOverview.total)}</TableCell>
                                    <TableCell>
                                        <span className="text-red-600">
                                            -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {!!index.startTime && !!index.endTime ? (
                                            <span className="text-sm text-gray-500">
                                                {getIndexDurationLabel(index.startTime, index.endTime)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => onCloneAction(index)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Clone index</p>
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
                                                                onClick={() => onEditAction(index)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit index</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteClick(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete index</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </>
                                            )}
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
                    {paginatedIndices.map(index => (
                        <MobileIndexCard key={index.id} index={index} />
                    ))}
                </div>
            </div>

            <IndicesPagination
                currentPage={currentPage}
                totalItems={sortedIndices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <DeleteIndexConfirmModal
                isOpen={deleteModalOpen}
                onCloseAction={() => setDeleteModalOpen(false)}
                onConfirmAction={handleDeleteConfirm}
                indexName={indexToDelete?.name || ""}
                isDeleting={isDeleting}
            />
        </TooltipProvider>
    );
}
