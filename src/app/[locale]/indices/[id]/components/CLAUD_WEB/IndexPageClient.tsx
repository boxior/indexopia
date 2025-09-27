"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {IndexOverview} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexOverview";
import {IndexChart} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexChart";
import {AssetsTable} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/AssetsTable";
import {IndexModal, IndexMode} from "@/app/[locale]/indices/components/CLAUD_WEB/IndexModal";
import {AssetWithHistoryOverviewPortionAndMaxDrawDown, Index} from "@/utils/types/general.types";
import {useSession} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {useIndexActions, UseIndexActionsReturns} from "@/app/[locale]/indices/[id]/hooks/useIndexActions.hook";
import {DeleteIndexConfirmModal} from "@/app/[locale]/indices/components/CLAUD_WEB/DeleteIndexConfirmModal";
import * as React from "react";
import {TooltipProvider} from "@/components/ui/tooltip";
import {useTranslations} from "next-intl";

export function IndexPageClient({index}: {index: Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null}) {
    const router = useRouter();
    const session = useSession();
    const currentUserId = session.data?.user?.id;

    const tIndex = useTranslations("index");

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
            savedIndex?.id && router.push(PAGES_URLS.index(savedIndex.id));
        }

        return savedIndex;
    };

    const handleDeleteConfirm: UseIndexActionsReturns["onDeleteConfirm"] = async () => {
        await onDeleteConfirm();
        router.push(PAGES_URLS.indices);
    };

    if (!index) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{tIndex("notFound.title")}</h1>
                    <p className="text-gray-600 mb-8">{tIndex("notFound.description")}</p>
                    <Button onClick={() => router.push(PAGES_URLS.indices)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {tIndex("navigation.backToIndices")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="container mx-auto px-4 py-8">
                {/* Back Navigation */}
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.push(PAGES_URLS.indices)} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {tIndex("navigation.backToIndices")}
                    </Button>
                </div>

                {/* Index Overview */}
                <div className="mb-8">
                    <IndexOverview
                        index={index}
                        currentUserId={currentUserId}
                        onEditAction={onEdit}
                        onDeleteAction={onDeleteClick}
                        onCloneAction={onClone}
                    />
                </div>

                {/* Chart */}
                <div className="mb-8">
                    <IndexChart index={index} />
                </div>

                {/* Assets Table */}
                <div className="mb-8">
                    <AssetsTable assets={index.assets} />
                </div>
            </div>

            <IndexModal
                isOpen={modalOpen}
                onCancelAction={onCancel}
                onSaveAction={handleSave}
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
        </TooltipProvider>
    );
}
