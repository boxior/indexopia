"use client";

import {IndexMode, ModalIndexData} from "@/app/indices/components/CLAUD_WEB/IndexModal";
import {
    actionCreateIndexOverview,
    actionDeleteIndexOverview,
    actionUpdateIndexOverview,
} from "@/app/indices/[id]/actions";
import {IndexOverview, IndexOverviewForCreate} from "@/utils/types/general.types";
import {getIndexOverviewAsset} from "@/utils/heleprs/index/index.helpers";
import {omit} from "lodash";
import {useSession} from "next-auth/react";
import {useState} from "react";

export type UseIndexActionsReturns = {
    // Action handlers
    onClone: (index: IndexOverview) => void;
    onEdit: (editIndex: IndexOverview) => void;
    onCreate: () => void;
    onSave: (indexData: ModalIndexData) => Promise<void>;
    onCancel: () => void;

    // Delete action handlers
    onDeleteClick: (index: IndexOverview) => void;
    onDeleteConfirm: () => Promise<void>;
    onDeleteCancel: () => void;

    // Modal state
    modalOpen: boolean;
    modalIndex: IndexOverviewForCreate | IndexOverview | undefined;
    indexMode: IndexMode | undefined;

    // Delete modal state
    deleteModalOpen: boolean;
    indexToDelete: IndexOverview | null;
    isDeleting: boolean;
};

export const useIndexActions = (): UseIndexActionsReturns => {
    const {data} = useSession();
    const currentUserId = data?.user?.id;

    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState<IndexOverviewForCreate | IndexOverview>();
    const [indexMode, setIndexMode] = useState<IndexMode>();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState<IndexOverview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleCancelAction = () => {
        setModalIndex(undefined);
        setIndexMode(undefined);
        setModalOpen(false);
    };

    const handleEditIndex = (editIndex: IndexOverview) => {
        setModalOpen(true);
        setModalIndex(editIndex);
        setIndexMode(IndexMode.EDIT);
    };

    const handleCreateIndex = () => {
        setModalOpen(true);
    };

    const handleCloneIndex = (index: IndexOverview) => {
        setModalOpen(true);

        const clonedIndex: IndexOverviewForCreate = {
            ...omit(index, "id"),
            userId: currentUserId,
            name: `${index.name} (Clone)`,
            systemId: undefined,
        };

        setModalIndex(clonedIndex);
        setIndexMode(IndexMode.CLONE);
    };

    const handleDeleteClick = (index: IndexOverview) => {
        setIndexToDelete(index);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (indexToDelete) {
                setIsDeleting(true);
                await actionDeleteIndexOverview?.(indexToDelete.id);
                setDeleteModalOpen(false);
                setIndexToDelete(null);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setIndexToDelete(null);
    };

    return {
        onClone: handleCloneIndex,
        onEdit: handleEditIndex,
        onCreate: handleCreateIndex,
        onSave: handleSaveAction,
        onCancel: handleCancelAction,
        //
        onDeleteClick: handleDeleteClick,
        onDeleteConfirm: handleDeleteConfirm,
        onDeleteCancel: handleDeleteCancel,
        //
        modalOpen,
        modalIndex,
        indexMode,
        deleteModalOpen,
        indexToDelete,
        isDeleting,
    };
};
