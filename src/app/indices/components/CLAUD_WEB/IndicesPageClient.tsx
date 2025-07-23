// app/indexes/page.tsx
"use client";

import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Plus, TrendingUp, TrendingDown, BarChart} from "lucide-react";
import {IndicesTable} from "@/app/indices/components/CLAUD_WEB/IndicesTable";
import {IndicesFilters, TOP_PERFORMANCE_COUNT} from "@/app/indices/components/CLAUD_WEB/IndicesFilters";
import {IndexModal, ModalIndexData, IndexMode} from "@/app/indices/components/CLAUD_WEB/IndexModal";
import {IndexOverview, Asset, Id, IndexOverviewForCreate} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";
import {
    actionCreateIndexOverview,
    actionDeleteIndexOverview,
    actionUpdateIndexOverview,
} from "@/app/indices/[id]/actions";
import {getIndexOverviewAsset} from "@/utils/heleprs/index/index.helpers";
import {omit} from "lodash";

export const IndexesPageClient = ({indices, assets}: {indices: IndexOverview[]; assets: Asset[]}) => {
    const session = useSession();
    const currentUserId = session.data?.user?.id;

    const [createUpdateModalOpen, setCreateUpdateModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState<IndexOverviewForCreate | IndexOverview>();
    const [indexMode, setIndexMode] = useState<IndexMode>();

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [performanceFilter, setPerformanceFilter] = useState("all");

    const availableAssets: Asset[] = assets;

    const preFilteredIndices = useMemo(() => {
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
                (performanceFilter === "top-performers" && !!index); // filter is below: topPerformanceIndices

            return matchesSearch && matchesType && matchesPerformance;
        });
    }, [indices, searchTerm, typeFilter, performanceFilter]);

    const topPerformanceIndices =
        performanceFilter === "top-performers"
            ? preFilteredIndices
                  .toSorted((a, b) => b.historyOverview.total - a.historyOverview.total)
                  .slice(0, TOP_PERFORMANCE_COUNT)
            : [];

    const filteredIndices =
        performanceFilter === "top-performers"
            ? preFilteredIndices.filter(i => topPerformanceIndices.map(i => i.id).includes(i.id))
            : preFilteredIndices;

    const handleSaveAction = async (indexData: ModalIndexData) => {
        if (indexMode === IndexMode.EDIT) {
            await actionUpdateIndexOverview({
                ...(modalIndex as IndexOverview),
                ...indexData,
                assets: indexData.assets.map(getIndexOverviewAsset),
                userId: currentUserId,
            });
            return;
        }

        await actionCreateIndexOverview({
            ...indexData,
            assets: indexData.assets.map(getIndexOverviewAsset),
            userId: currentUserId,
        });
    };

    const handleCloseAction = () => {
        setModalIndex(undefined);
        setIndexMode(undefined);
        setCreateUpdateModalOpen(false);
    };

    const handleEditIndex = (editIndex: IndexOverview) => {
        setCreateUpdateModalOpen(true);
        setModalIndex(editIndex);
        setIndexMode(IndexMode.EDIT);
    };

    const handleDeleteIndex = async (indexId: Id) => {
        await actionDeleteIndexOverview(indexId);
    };

    const handleCloneIndex = (index: IndexOverview) => {
        setCreateUpdateModalOpen(true);

        const clonedIndex: IndexOverviewForCreate = {
            ...omit(index, "id"),
            userId: currentUserId,
            name: `${index.name} (Clone)`,
            systemId: undefined,
        };

        setModalIndex(clonedIndex);
        setIndexMode(IndexMode.CLONE);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("all");
        setPerformanceFilter("all");
    };

    const getAvgReturn = (indices: IndexOverview[]) => {
        return indices.reduce((sum, i) => sum + i.historyOverview.total, 0) / indices.length;
    };

    const systemIndices = indices.filter(i => i.systemId);
    const useIndices = indices.filter(i => i.userId);

    // Calculate statistics
    const stats = {
        totalIndices: indices.length,
        systemIndices: systemIndices.length,
        customIndices: indices.filter(i => i.userId).length,

        systemAvgReturn: getAvgReturn(systemIndices),
        userAvrReturn: getAvgReturn(useIndices),
        avgReturn: getAvgReturn(indices),
    };

    const renderArrow = (avgReturn: number) => {
        return avgReturn > 0 ? (
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
        ) : (
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
        );
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
                                {renderArrow(stats.systemAvgReturn)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.systemIndices}</div>
                                <p className="text-xs text-muted-foreground">Professional strategies</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Custom Indices</CardTitle>
                                {renderArrow(stats.userAvrReturn)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.customIndices}</div>
                                <p className="text-xs text-muted-foreground">Your personal strategies</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
                                {renderArrow(stats.avgReturn)}
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

                        <Button onClick={() => setCreateUpdateModalOpen(true)}>
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
            <IndexModal
                isOpen={createUpdateModalOpen}
                onCloseAction={handleCloseAction}
                onSaveAction={handleSaveAction}
                availableAssets={availableAssets}
                indexOverview={modalIndex}
                mode={indexMode}
            />
        </>
    );
};
