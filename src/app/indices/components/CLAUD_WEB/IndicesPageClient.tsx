// app/indexes/page.tsx
"use client";

import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart, Plus, TrendingDown, TrendingUp} from "lucide-react";
import {IndicesTable} from "@/app/indices/components/CLAUD_WEB/IndicesTable";
import {IndicesFilters, TOP_PERFORMANCE_COUNT} from "@/app/indices/components/CLAUD_WEB/IndicesFilters";
import {IndexModal, IndexMode, ModalIndexData} from "@/app/indices/components/CLAUD_WEB/IndexModal";
import {Asset, EntityMode, Id, IndexOverview, IndexOverviewForCreate} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";
import {
    actionCreateIndexOverview,
    actionDeleteIndexOverview,
    actionUpdateIndexOverview,
} from "@/app/indices/[id]/actions";
import {getIndexOverviewAsset} from "@/utils/heleprs/index/index.helpers";
import {omit} from "lodash";
import {renderSafelyNumber} from "@/utils/heleprs/ui/renderSavelyNumber.helper";
import {NumeralFormat} from "@numeral";

// TODO: Add Chart Preview
// Clear unused code, but leave ORIGINAL one
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
                (performanceFilter === "positive" && index.historyOverview.days7 > 0) ||
                (performanceFilter === "negative" && index.historyOverview.days7 < 0) ||
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
        avgReturn: getAvgReturn(filteredIndices),
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
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Crypto Indices</h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            Explore and manage your crypto investment indices
                        </p>
                    </div>
                    <div className={"hidden md:block"}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Indices</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {renderSafelyNumber(stats.totalIndices, NumeralFormat.INTEGER)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {renderSafelyNumber(stats.systemIndices, NumeralFormat.INTEGER)} system,{" "}
                                        {renderSafelyNumber(stats.customIndices, NumeralFormat.INTEGER)} custom
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">System Indices</CardTitle>
                                    {renderArrow(stats.systemAvgReturn)}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {renderSafelyNumber(stats.systemIndices, NumeralFormat.INTEGER)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Professional strategies</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Custom Indices</CardTitle>
                                    {renderArrow(stats.userAvrReturn)}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {renderSafelyNumber(stats.customIndices, NumeralFormat.INTEGER)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Your personal strategies</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
                                    {renderArrow(stats.avgReturn)}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{renderSafelyNumber(stats.avgReturn)}%</div>
                                    <p className="text-xs text-muted-foreground">Across all filtered indices</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className={"md:hidden"}>
                        <div className=" grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
                            <Card className="min-h-0">
                                <CardContent className="p-2 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="md:block">
                                            <span className="text-xs md:hidden font-medium text-muted-foreground">
                                                Total:{" "}
                                                <span className="font-bold text-foreground">{stats.totalIndices}</span>
                                            </span>
                                            <div className="hidden md:block text-2xl font-bold">
                                                {stats.totalIndices}
                                            </div>
                                            <p className="hidden md:block text-sm font-medium text-muted-foreground">
                                                Total
                                            </p>
                                        </div>
                                        <BarChart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="min-h-0">
                                <CardContent className="p-2 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="md:block">
                                            <span className="text-xs md:hidden font-medium text-muted-foreground">
                                                System:{" "}
                                                <span className="font-bold text-foreground">
                                                    {renderSafelyNumber(stats.systemIndices, NumeralFormat.INTEGER)}
                                                </span>
                                            </span>
                                            <div className="hidden md:block text-2xl font-bold">
                                                {renderSafelyNumber(stats.systemIndices, NumeralFormat.INTEGER)}
                                            </div>
                                            <p className="hidden md:block text-sm font-medium text-muted-foreground">
                                                System
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">{renderArrow(stats.systemAvgReturn)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="min-h-0">
                                <CardContent className="p-2 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="md:block">
                                            <span className="text-xs md:hidden font-medium text-muted-foreground">
                                                Custom:{" "}
                                                <span className="font-bold text-foreground">
                                                    {renderSafelyNumber(stats.customIndices, NumeralFormat.INTEGER)}
                                                </span>
                                            </span>
                                            <div className="hidden md:block text-2xl font-bold">
                                                {renderSafelyNumber(stats.customIndices, NumeralFormat.INTEGER)}
                                            </div>
                                            <p className="hidden md:block text-sm font-medium text-muted-foreground">
                                                Custom
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">{renderArrow(stats.userAvrReturn)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="min-h-0">
                                <CardContent className="p-2 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="md:block">
                                            <span className="text-xs md:hidden font-medium text-muted-foreground">
                                                Return:{" "}
                                                <span className="font-bold text-foreground">
                                                    {renderSafelyNumber(stats.avgReturn, NumeralFormat.INTEGER)}%
                                                </span>
                                            </span>
                                            <div className="hidden md:block text-2xl font-bold">
                                                {renderSafelyNumber(stats.avgReturn, NumeralFormat.INTEGER)}%
                                            </div>
                                            <p className="hidden md:block text-sm font-medium text-muted-foreground">
                                                Return
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">{renderArrow(stats.avgReturn)}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {/* Filters and Actions */}
                    <div className="flex flex-col gap-2 mb-4 md:mb-6">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <IndicesFilters
                                    onSearchChange={setSearchTerm}
                                    onTypeFilter={setTypeFilter}
                                    onPerformanceFilter={setPerformanceFilter}
                                    onClearFilters={handleClearFilters}
                                />
                            </div>

                            <Button
                                onClick={() => setCreateUpdateModalOpen(true)}
                                size="sm"
                                className="w-full sm:w-auto flex-shrink-0 h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
                            >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Create Custom Index</span>
                                <span className="xs:hidden">Create Index</span>
                            </Button>
                        </div>
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
                            mode={EntityMode.VIEW}
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
