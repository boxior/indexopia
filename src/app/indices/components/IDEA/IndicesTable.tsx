"use client";

import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Copy,
    Trash2,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import {IndexForm} from "./IndexForm";
import {DeleteConfirmDialog} from "./DeleteConfirmDialog";
import {cloneIndex, deleteIndex} from "@/app/indices/components/IDEA/actions";
import {useRouter} from "next/navigation";

interface IndexData {
    id: string;
    name: string;
    description: string;
    performance: number;
    status: "active" | "inactive" | "draft";
    createdAt: Date;
    updatedAt: Date;
    stockCount: number;
    category: string;
}

interface IndicesTableProps {
    initialIndices: IndexData[];
}

type SortField = "name" | "performance" | "createdAt" | "stockCount";
type SortDirection = "asc" | "desc";

export default function IndicesTable({initialIndices}: IndicesTableProps) {
    const [indices, setIndices] = useState<IndexData[]>(initialIndices);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<IndexData | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<IndexData | null>(null);
    const router = useRouter();

    const filteredAndSortedIndices = useMemo(() => {
        let filtered = indices.filter(index => {
            const matchesSearch =
                index.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                index.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || index.status === statusFilter;
            const matchesCategory = categoryFilter === "all" || index.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });

        return filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === "createdAt") {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [indices, searchTerm, statusFilter, categoryFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleClone = async (index: IndexData) => {
        try {
            const clonedIndex = await cloneIndex(index.id);
            setIndices(prev => [clonedIndex, ...prev]);
        } catch (error) {
            console.error("Error cloning index:", error);
        }
    };

    const handleDelete = async (index: IndexData) => {
        try {
            await deleteIndex(index.id);
            setIndices(prev => prev.filter(i => i.id !== index.id));
            setDeletingIndex(null);
        } catch (error) {
            console.error("Error deleting index:", error);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default";
            case "inactive":
                return "secondary";
            case "draft":
                return "outline";
            default:
                return "secondary";
        }
    };

    const uniqueCategories = [...new Set(indices.map(index => index.category))];

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search indices..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                                    Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Category
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All</DropdownMenuItem>
                                {uniqueCategories.map(category => (
                                    <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                                        {category}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Index
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Index</DialogTitle>
                        </DialogHeader>
                        <IndexForm
                            onSuccess={() => {
                                setIsCreateDialogOpen(false);
                                router.refresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Indices ({filteredAndSortedIndices.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-2">
                                        Name
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("stockCount")}
                                >
                                    <div className="flex items-center gap-2">
                                        Stocks
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("performance")}
                                >
                                    <div className="flex items-center gap-2">
                                        Performance
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("createdAt")}
                                >
                                    <div className="flex items-center gap-2">
                                        Created
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[70px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedIndices.map(index => (
                                <TableRow key={index.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="font-semibold">{index.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {index.description}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{index.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(index.status)}>{index.status}</Badge>
                                    </TableCell>
                                    <TableCell>{index.stockCount}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {index.performance > 0 ? (
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className={index.performance > 0 ? "text-green-600" : "text-red-600"}>
                                                {index.performance > 0 ? "+" : ""}
                                                {index.performance}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(index.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingIndex(index)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleClone(index)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Clone
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingIndex(index)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredAndSortedIndices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No indices found matching your criteria.</div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {editingIndex && (
                <Dialog open={!!editingIndex} onOpenChange={() => setEditingIndex(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Index</DialogTitle>
                        </DialogHeader>
                        <IndexForm
                            initialData={editingIndex}
                            onSuccess={() => {
                                setEditingIndex(null);
                                router.refresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {deletingIndex && (
                <DeleteConfirmDialog
                    isOpen={!!deletingIndex}
                    onClose={() => setDeletingIndex(null)}
                    onConfirm={() => handleDelete(deletingIndex)}
                    indexName={deletingIndex.name}
                />
            )}
        </div>
    );
}
