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

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onConfirmAction: () => void;
    indexName: string;
    isDeleting: boolean;
}

export function DeleteIndexConfirmModal({
    isOpen,
    onCloseAction,
    onConfirmAction,
    indexName,
    isDeleting,
}: DeleteConfirmModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onCloseAction}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Index</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the index "{indexName}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCloseAction}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirmAction}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
