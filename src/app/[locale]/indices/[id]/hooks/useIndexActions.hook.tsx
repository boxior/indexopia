"use client";

import {IndexMode, ModalIndexData} from "@/app/[locale]/indices/components/CLAUD_WEB/IndexModal";
import {
    actionCreateIndexOverview,
    actionDeleteIndexOverview,
    actionUpdateIndexOverview,
} from "@/app/[locale]/indices/[id]/actions";
import {IndexOverview, IndexOverviewForCreate} from "@/utils/types/general.types";
import {getIndexOverviewAsset} from "@/utils/heleprs/index/index.helpers";
import {omit} from "lodash";
import {useSession} from "next-auth/react";
import {useState} from "react";

export type UseIndexActionsReturns = {
    // Action handlers
    onClone: (index: IndexOverview) => void;
    onCloneToSystem: (index: IndexOverview) => void;
    onEdit: (editIndex: IndexOverview) => void;
    onEditSystem: (editIndex: IndexOverview) => void;
    onCreate: () => void;
    onSave: (indexData: ModalIndexData) => Promise<IndexOverview | null>;
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

    const handleSaveAction = async (indexData: ModalIndexData): Promise<IndexOverview | null> => {
        if (indexMode === IndexMode.EDIT) {
            return await actionUpdateIndexOverview({
                ...(modalIndex as IndexOverview),
                ...indexData,
                assets: indexData.assets.map(getIndexOverviewAsset),
                userId: currentUserId,
            });
        }

        if (indexMode === IndexMode.EDIT_SYSTEM) {
            return await actionUpdateIndexOverview({
                ...(modalIndex as IndexOverview),
                ...indexData,
                assets: indexData.assets.map(getIndexOverviewAsset),
            });
        }

        if (indexMode === IndexMode.CLONE_TO_SYSTEM) {
            return await actionCreateIndexOverview({
                ...indexData,
                assets: indexData.assets.map(getIndexOverviewAsset),
            });
        }

        return await actionCreateIndexOverview({
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

    const handleCloneToSystemIndex = (index: IndexOverview) => {
        setModalOpen(true);

        const clonedIndex: IndexOverviewForCreate = {
            systemId: index.id.toString(),
            ...omit(index, "id"),
            name: `${index.name} (Clone)`,
        };

        setModalIndex(clonedIndex);
        setIndexMode(IndexMode.CLONE_TO_SYSTEM);
    };

    const handleEditSystemIndex = (editIndex: IndexOverview) => {
        setModalOpen(true);
        setModalIndex(omit(editIndex, "userId"));
        setIndexMode(IndexMode.EDIT_SYSTEM);
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
        onCloneToSystem: handleCloneToSystemIndex,
        onEdit: handleEditIndex,
        onEditSystem: handleEditSystemIndex,
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
