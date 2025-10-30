"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {IndexOverview} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexOverview";
import {IndexChart} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/IndexChart";
import {AssetsTable} from "@/app/[locale]/indices/[id]/components/CLAUD_WEB/AssetsTable";
import {IndexModal, IndexMode} from "@/app/[locale]/indices/components/CLAUD_WEB/IndexModal";
import {useSession} from "next-auth/react";
import {HISTORY_OVERVIEW_DAYS, PAGES_URLS} from "@/utils/constants/general.constants";
import {useIndexActions, UseIndexActionsReturns} from "@/app/[locale]/indices/[id]/hooks/useIndexActions.hook";
import {DeleteIndexConfirmModal} from "@/app/[locale]/indices/components/CLAUD_WEB/DeleteIndexConfirmModal";
import * as React from "react";
import {TooltipProvider} from "@/components/ui/tooltip";
import {useTranslations} from "next-intl";
import {
    AssetWithHistoryOverviewPortionAndMaxDrawDown,
    Index,
    IndexOverview as IndexOverviewType,
} from "@/utils/types/general.types";
import ContentLoader from "@/components/Suspense/ContentLoader";
import useSWR from "swr";
import {fetcher} from "@/lib/fetcher";
import {User} from "@prisma/client";
import moment from "moment/moment";
import merge from "lodash/merge";

export function IndexPageClient({index}: {index: IndexOverviewType | null}) {
    const router = useRouter();
    const session = useSession();
    const currentUser = session.data?.user as User;

    const tIndex = useTranslations("index");

    const overviewStartTimeTest = moment().utc().startOf("d").add(-HISTORY_OVERVIEW_DAYS, "days").valueOf();
    // caching is managed by `actions` inside the `/api/indices` route vie `use cache` directive.`
    const indexId = index?.id;
    const {data: indexWithOverviewHistory, isLoading: isLoadingIndexWithOverviewHistory} =
        useSWR<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null>(
            indexId ? () => `/api/indices/${index?.id ?? ""}&startTime=${overviewStartTimeTest}` : null,
            fetcher
        );
    // caching is managed by `actions` inside the `/api/indices` route vie `use cache` directive.`
    const {
        data: indexWithFullHistory,
        isLoading: isLoadingIndexWithFullHistory,
        mutate: mutateIndexWithFullHistory,
    } = useSWR<Index<AssetWithHistoryOverviewPortionAndMaxDrawDown> | null>(
        indexId && !!indexWithOverviewHistory ? () => `/api/indices/${index?.id ?? ""}` : null,
        fetcher
    );

    const indexWithHistory = merge(indexWithOverviewHistory, indexWithFullHistory);

    const {
        onSave,
        onClone,
        onCloneToSystem,
        onEditSystem,
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

        if (indexMode === IndexMode.CLONE || indexMode === IndexMode.CLONE_TO_SYSTEM) {
            savedIndex?.id && router.push(PAGES_URLS.index(savedIndex.id));
        }

        await mutateIndexWithFullHistory();
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

    const renderIndexChart = () => {
        switch (true) {
            case isLoadingIndexWithOverviewHistory:
                return <ContentLoader type="chart" count={1} />;
            case !!indexWithHistory:
                return <IndexChart index={indexWithHistory} isLoadingFullHistory={isLoadingIndexWithFullHistory} />;
            default:
                return null;
        }
    };

    const renderIndexAssets = () => {
        switch (true) {
            case isLoadingIndexWithOverviewHistory:
                return <ContentLoader type="table" count={10} />;
            case !!indexWithHistory:
                return (
                    <AssetsTable
                        assets={indexWithHistory.assets}
                        isLoadingFullHistory={isLoadingIndexWithFullHistory}
                    />
                );
            default:
                return null;
        }
    };

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
                        currentUser={currentUser}
                        onEditAction={onEdit}
                        onDeleteAction={onDeleteClick}
                        onCloneAction={onClone}
                        onCloneToSystemAction={onCloneToSystem}
                        onEditSystemAction={onEditSystem}
                    />
                </div>

                {/* Chart */}
                <div className="mb-8">{renderIndexChart()}</div>

                {/* Assets Table */}
                <div className="mb-8">{renderIndexAssets()}</div>
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
