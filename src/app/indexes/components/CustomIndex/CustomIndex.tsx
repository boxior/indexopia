"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Asset, CustomIndexType} from "@/utils/types/general.types";
import {useState} from "react";
import {CustomIndexDialog} from "@/app/indexes/components/CustomIndex/CustomIndexDialog";
import {clientApiDeleteCustomIndex} from "@/utils/clientApi/customIndex.clientApi";
import {redirect} from "next/navigation";
export function CustomIndex({assets, customIndex}: {assets: Asset[]; customIndex?: CustomIndexType}) {
    const [open, setOpen] = useState<boolean>(false);

    const onOpenChange = (bool: boolean) => {
        setOpen(bool);
    };

    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const doDelete = customIndex?.id && !customIndex?.isDefault;

    const handleDelete = async () => {
        if (doDelete) {
            return;
        }
        await clientApiDeleteCustomIndex(customIndex?.id ?? ""); // need tls
        redirect("/indexes");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Button variant="outline" onClick={openDialog}>
                {`${customIndex ? "Edit" : "Create"} Custom Index ${customIndex ? `(${customIndex.name})` : ""}`}
            </Button>
            {doDelete && (
                <Button variant="outline" type={"button"} onClick={handleDelete}>
                    Delete
                </Button>
            )}
            {open && <CustomIndexDialog assets={assets} closeDialog={closeDialog} customIndex={customIndex} />}
        </Dialog>
    );
}
