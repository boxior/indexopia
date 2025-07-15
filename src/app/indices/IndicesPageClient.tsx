// app/indexes/page.tsx
"use client";

import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Plus, TrendingUp, TrendingDown, BarChart} from "lucide-react";
import {IndicesTable} from "@/app/indices/components/CLAUD/IndicesTable";
import {IndicesFilters} from "@/app/indices/components/CLAUD/IndicesFilters";
import {CreateIndexModal, CreateIndexData} from "@/app/indices/components/CLAUD/CreateIndexModal";
import {IndexOverview, Asset, Id} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";

export const IndexesPageClient = ({data, assets}: {data: IndexOverview[]; assets: Asset[]}) => {
    const session = useSession();
    const currentUserId = session.data?.user?.id;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [performanceFilter, setPerformanceFilter] = useState("all");

    // Mock data - replace with actual API calls
    const [indices, setIndices] = useState<IndexOverview[]>(data);

    const availableAssets: Asset[] = assets;

    const filteredIndices = useMemo(() => {
        return indices.filter(index => {
            // Search filter
            const matchesSearch =
                index.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                index.assets.some(
                    asset =>
                        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                );

            // Type filter
            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "system" && index.systemId) ||
                (typeFilter === "custom" && index.userId);

            // Performance filter
            const matchesPerformance =
                performanceFilter === "all" ||
                (performanceFilter === "positive" && index.historyOverview.days1 > 0) ||
                (performanceFilter === "negative" && index.historyOverview.days1 < 0) ||
                (performanceFilter === "top-performers" && index.historyOverview.total > 1000);

            return matchesSearch && matchesType && matchesPerformance;
        });
    }, [indices, searchTerm, typeFilter, performanceFilter]);

    const handleCreateIndex = (indexData: CreateIndexData) => {
        const newIndex: IndexOverview = {
            id: `custom-${Date.now()}`,
            userId: currentUserId,
            name: indexData.name,
            assets: indexData.assets.map(asset => ({
                id: asset.id,
                name: asset.name,
                symbol: asset.symbol,
                rank: availableAssets.find(a => a.id === asset.id)?.rank || "0",
                portion: asset.portion,
            })),
            historyOverview: {
                total: 0,
                days1: 0,
                days7: 0,
                days30: 0,
            },
            maxDrawDown: {value: 0, startTime: new Date().toISOString(), endTime: new Date().toISOString()},
            startTime: Date.now(),
            endTime: Date.now(),
        };

        setIndices([...indices, newIndex]);
    };

    const handleEditIndex = (index: IndexOverview) => {
        // TODO: Implement edit functionality
        console.log("Edit index:", index);
    };

    const handleDeleteIndex = (indexId: Id) => {
        setIndices(indices.filter(index => index.id !== indexId));
    };

    const handleCloneIndex = (index: IndexOverview) => {
        const clonedIndex: IndexOverview = {
            ...index,
            id: `clone-${Date.now()}`,
            userId: currentUserId,
            name: `${index.name} (Clone)`,
            systemId: undefined,
        };

        setIndices([...indices, clonedIndex]);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("all");
        setPerformanceFilter("all");
    };

    // Calculate statistics
    const stats = {
        totalIndices: indices.length,
        systemIndices: indices.filter(i => i.systemId).length,
        customIndices: indices.filter(i => i.userId).length,
        avgReturn: indices.reduce((sum, i) => sum + i.historyOverview.total, 0) / indices.length,
    };

    return (
        <>
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crypto Indices</h1>
                        <p className="text-gray-600">Explore and manage your crypto investment indices</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Indices</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalIndices}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.systemIndices} system, {stats.customIndices} custom
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Indices</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.systemIndices}</div>
                                <p className="text-xs text-muted-foreground">Professional strategies</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Custom Indices</CardTitle>
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.customIndices}</div>
                                <p className="text-xs text-muted-foreground">Your personal strategies</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.avgReturn.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Across all indices</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <IndicesFilters
                            onSearchChange={setSearchTerm}
                            onTypeFilter={setTypeFilter}
                            onPerformanceFilter={setPerformanceFilter}
                            onClearFilters={handleClearFilters}
                        />

                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Custom Index
                        </Button>
                    </div>

                    {/* Results Info */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing {filteredIndices.length} of {indices.length} indices
                        </p>
                    </div>

                    {/* Indices Table */}
                    <div className="bg-white rounded-lg shadow">
                        <IndicesTable
                            indices={filteredIndices}
                            onEditAction={handleEditIndex}
                            onDeleteAction={handleDeleteIndex}
                            onCloneAction={handleCloneIndex}
                            currentUserId={currentUserId}
                        />
                    </div>

                    {/* Empty State */}
                    {filteredIndices.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <div className="text-gray-500">
                                <BarChart className="h-12 w-12 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No indices found</h3>
                                <p className="text-sm">
                                    {searchTerm || typeFilter !== "all" || performanceFilter !== "all"
                                        ? "Try adjusting your filters or search terms"
                                        : "Create your first custom index to get started"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Index Modal */}
            <CreateIndexModal
                isOpen={createModalOpen}
                onCloseAction={() => setCreateModalOpen(false)}
                onSaveAction={handleCreateIndex}
                availableAssets={availableAssets}
            />
        </>
    );
};
