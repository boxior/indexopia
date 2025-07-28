"use client";
import {redirect, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {IndexOverview} from "@/app/indices/[id]/components/CLAUD_WEB/IndexOverview";
import {IndexChart} from "@/app/indices/[id]/components/CLAUD_WEB/IndexChart";
import {AssetsTable} from "@/app/indices/[id]/components/CLAUD_WEB/AssetsTable";
import {IndexModal, IndexMode} from "@/app/indices/components/CLAUD_WEB/IndexModal";
import {Asset, AssetWithHistoryOverviewPortionAndMaxDrawDown, Index} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {useIndexActions, UseIndexActionsReturns} from "@/app/indices/[id]/hooks/useIndexActions.hook";
import {DeleteIndexConfirmModal} from "@/app/indices/components/CLAUD_WEB/DeleteIndexConfirmModal";
import * as React from "react";

export function IndexPageClient({
    index,
    assets: availableAssets,
}: {
    index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null;
    assets: Asset[];
}) {
    const router = useRouter();
    const session = useSession();
    const currentUserId = session.data?.user?.id;

    const {
        onSave,
        onClone,
        onEdit,
        onDeleteClick,
        modalOpen,
        onCancel,
        modalIndex,
        indexMode,
        indexToDelete,
        deleteModalOpen,
        onDeleteConfirm,
        isDeleting,
        onDeleteCancel,
    } = useIndexActions();

    const handleSave: UseIndexActionsReturns["onSave"] = async index => {
        const savedIndex = await onSave(index);

        if (indexMode === IndexMode.CLONE) {
            savedIndex?.id && redirect(PAGES_URLS.index(savedIndex.id));
        }

        return savedIndex;
    };

    const handleDeleteConfirm: UseIndexActionsReturns["onDeleteConfirm"] = async () => {
        await onDeleteConfirm();
        redirect(PAGES_URLS.indices);
    };

    if (!index) {
        return (
            <>
                <div className="flex min-h-screen bg-gray-50">
                    <main className="flex-1 p-8">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Index not found</h1>
                            <p className="text-gray-600 mb-8">The index you're looking for doesn't exist.</p>
                            <Button onClick={() => router.push(PAGES_URLS.indices)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Indices
                            </Button>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <main className="flex-1 p-8">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Button variant="outline" onClick={() => router.push(PAGES_URLS.indices)} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Indices
                        </Button>
                    </div>

                    {/* Index Overview */}
                    <IndexOverview
                        index={index}
                        currentUserId={currentUserId}
                        onEditAction={onEdit}
                        onDeleteAction={onDeleteClick}
                        onCloneAction={onClone}
                    />

                    {/* Chart */}
                    <IndexChart index={index} />

                    {/* Assets Table */}
                    <AssetsTable assets={index.assets} />
                </main>
            </div>

            <IndexModal
                isOpen={modalOpen}
                onCancelAction={onCancel}
                onSaveAction={handleSave}
                availableAssets={availableAssets}
                indexOverview={modalIndex}
                mode={indexMode}
            />
            <DeleteIndexConfirmModal
                isOpen={deleteModalOpen}
                onCancelAction={onDeleteCancel}
                onConfirmAction={handleDeleteConfirm}
                indexName={indexToDelete?.name || ""}
                isDeleting={isDeleting}
            />
        </>
    );
}
