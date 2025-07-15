"use client";

import {useState, useMemo} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Copy, Edit, Trash2, MoreHorizontal, ArrowUpDown, Plus, Search, Filter} from "lucide-react";
import {Id, IndexOverview} from "@/utils/types/general.types";
import {actionOnClone, actionOnCreateNew, actionOnDelete, actionOnEdit} from "@/app/indices/components/CLAUD/actions";

interface IndicesTableProps {
    indices: IndexOverview[];
    userId?: string;
}

type SortField = "name" | "totalReturn" | "performance24h" | "performance7d" | "maxDrawDown";
type SortDirection = "asc" | "desc";

export default function IndicesTable({indices, userId}: IndicesTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "system" | "custom">("all");
    const [sortField, setSortField] = useState<SortField>("totalReturn");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState<Id | null>(null);

    const filteredAndSortedIndices = useMemo(() => {
        let filtered = indices.filter(index => {
            const matchesSearch =
                index.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                index.assets.some(
                    asset =>
                        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "system" && index.systemId) ||
                (typeFilter === "custom" && index.userId);

            return matchesSearch && matchesType;
        });

        filtered.sort((a, b) => {
            let aValue: number, bValue: number;

            switch (sortField) {
                case "name":
                    return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                case "totalReturn":
                    aValue = a.historyOverview.total;
                    bValue = b.historyOverview.total;
                    break;
                case "performance24h":
                    aValue = a.historyOverview.days1;
                    bValue = b.historyOverview.days1;
                    break;
                case "performance7d":
                    aValue = a.historyOverview.days7;
                    bValue = b.historyOverview.days7;
                    break;
                case "maxDrawDown":
                    aValue = a.maxDrawDown.value;
                    bValue = b.maxDrawDown.value;
                    break;
                default:
                    aValue = a.historyOverview.total;
                    bValue = b.historyOverview.total;
            }

            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }, [indices, searchTerm, typeFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const handleDeleteClick = (indexId: Id) => {
        setIndexToDelete(indexId);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (indexToDelete) {
            actionOnDelete(indexToDelete);
            setDeleteModalOpen(false);
            setIndexToDelete(null);
        }
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

    const formatDuration = (startTime?: number, endTime?: number) => {
        if (!startTime) return "N/A";
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        const days = diffDays % 30;

        if (years > 0) {
            return `${years} years ${months} months ${days} days`;
        } else if (months > 0) {
            return `${months} months ${days} days`;
        } else {
            return `${days} days`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Crypto Indices</h1>
                    <p className="text-gray-600 mt-1">Discover and manage your crypto index portfolios</p>
                </div>
                <Button onClick={actionOnCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Index
                </Button>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Free Crypto Indices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search indices or assets..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={typeFilter}
                            onValueChange={(value: "all" | "system" | "custom") => setTypeFilter(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Indices</SelectItem>
                                <SelectItem value="system">System Indices</SelectItem>
                                <SelectItem value="custom">Custom Indices</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort("name")}>
                                            Index
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Assets</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort("performance24h")}>
                                            24h %
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort("performance7d")}>
                                            7d %
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>30d Chart</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort("maxDrawDown")}>
                                            Max DrawDown %
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort("totalReturn")}>
                                            Total %
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Start from</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedIndices.map((index, idx) => (
                                    <TableRow key={index.id}>
                                        <TableCell className="font-medium">{idx + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{index.name}</span>
                                                {index.systemId && (
                                                    <Badge variant="secondary" className="w-fit mt-1">
                                                        System
                                                    </Badge>
                                                )}
                                                {index.userId && (
                                                    <Badge variant="outline" className="w-fit mt-1">
                                                        Custom
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {index.assets.slice(0, 3).map(asset => (
                                                    <Badge key={asset.id} variant="secondary" className="text-xs">
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
                                        <TableCell>
                                            <div className="h-10 w-20 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                                                <div className="h-6 w-16 bg-green-400 rounded-sm opacity-60"></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-red-600">{index.maxDrawDown.value.toFixed(2)}%</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-green-600">
                                                {index.historyOverview.total.toFixed(2)}%
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {index.startTime ? new Date(index.startTime).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-500">
                                                {formatDuration(index.startTime, index.endTime)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {index.systemId && (
                                                        <DropdownMenuItem onClick={() => actionOnClone(index)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Clone
                                                        </DropdownMenuItem>
                                                    )}
                                                    {index.userId && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => actionOnEdit(index)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(index.id)}
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

                    {filteredAndSortedIndices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No indices found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your custom index and remove all
                            associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
