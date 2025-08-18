// components/indices/delete-confirm-modal.tsx
"use client";

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
import {useTranslations} from "next-intl";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onCancelAction: () => void;
    onConfirmAction: () => void;
    indexName: string;
    isDeleting: boolean;
}

export function DeleteIndexConfirmModal({
    isOpen,
    onCancelAction,
    onConfirmAction,
    indexName,
    isDeleting,
}: DeleteConfirmModalProps) {
    const tCommon = useTranslations("common");
    const tDeleteModal = useTranslations("deleteIndexModal");

    return (
        <AlertDialog open={isOpen} onOpenChange={onCancelAction}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{tDeleteModal("title")}</AlertDialogTitle>
                    <AlertDialogDescription>{tDeleteModal("description", {indexName})}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancelAction}>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirmAction}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? tCommon("deleting") : tCommon("delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
