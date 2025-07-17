"use client";
import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Copy, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown} from "lucide-react";
import {Id, IndexOverview} from "@/utils/types/general.types";
import {DeleteConfirmModal} from "@/app/indices/components/CLAUD/DeleteConfirmModal";
import {Pagination} from "@/app/indices/components/CLAUD/Pagination";

interface IndicesTableProps {
    indices: IndexOverview[];
    onEditAction: (index: IndexOverview) => void;
    onDeleteAction: (indexId: Id) => void;
    onCloneAction: (index: IndexOverview) => void;
    currentUserId?: string;
}

type SortField = "name" | "total" | "days1" | "days7" | "maxDrawDown";
type SortOrder = "asc" | "desc";

export function IndicesTable({indices, onEditAction, onDeleteAction, onCloneAction, currentUserId}: IndicesTableProps) {
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState<IndexOverview | null>(null);

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
                case "days1":
                    aValue = a.historyOverview.days1;
                    bValue = b.historyOverview.days1;
                    break;
                case "days7":
                    aValue = a.historyOverview.days7;
                    bValue = b.historyOverview.days7;
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
                {value.toFixed(2)}%
            </span>
        );
    };

    const handleDeleteClick = (index: IndexOverview) => {
        setIndexToDelete(index);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (indexToDelete) {
            onDeleteAction(indexToDelete.id);
            setDeleteModalOpen(false);
            setIndexToDelete(null);
        }
    };

    const isSystemIndex = (index: IndexOverview) => !!index.systemId;
    const isUserIndex = (index: IndexOverview) => !!index.userId;

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
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
                                    onClick={() => handleSort("days1")}
                                >
                                    24h
                                    {getSortIcon("days1")}
                                </Button>
                            </TableHead>
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
                            <TableRow key={index.id}>
                                <TableCell>
                                    <Badge variant={isSystemIndex(index) ? "default" : "secondary"}>
                                        {isSystemIndex(index) ? "System" : "Custom"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{index.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {index.assets.slice(0, 3).map((asset, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
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
                                <TableCell>{formatPercentage(index.historyOverview.days1)}</TableCell>
                                <TableCell>{formatPercentage(index.historyOverview.days7)}</TableCell>
                                <TableCell>{formatPercentage(index.historyOverview.total)}</TableCell>
                                <TableCell>
                                    <span className="text-red-600">
                                        -{Math.abs(index.maxDrawDown.value).toFixed(2)}%
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {index.startTime && index.endTime ? (
                                        <span className="text-sm text-gray-500">
                                            {Math.ceil((index.endTime - index.startTime) / (1000 * 60 * 60 * 24 * 30))}{" "}
                                            months
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {isSystemIndex(index) && (
                                                <DropdownMenuItem onClick={() => onCloneAction(index)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Clone
                                                </DropdownMenuItem>
                                            )}
                                            {isUserIndex(index) && index.userId === currentUserId && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEditAction(index)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(index)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={sortedIndices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onCloseAction={() => setDeleteModalOpen(false)}
                onConfirmAction={handleDeleteConfirm}
                indexName={indexToDelete?.name || ""}
            />
        </>
    );
}
