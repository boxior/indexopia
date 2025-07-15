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
}

export function DeleteConfirmModal({isOpen, onCloseAction, onConfirmAction, indexName}: DeleteConfirmModalProps) {
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
                    <AlertDialogAction onClick={onConfirmAction} className="bg-red-600 hover:bg-red-700">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
