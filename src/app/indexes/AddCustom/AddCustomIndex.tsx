"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Asset} from "@/utils/types/general.types";
import {useState} from "react";
import {AddCustomIndexDialog} from "@/app/indexes/AddCustom/AddCustomIndexDialog";

export function AddCustomIndex({assets}: {assets: Asset[]}) {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Button variant="outline" onClick={openDialog}>
                Add Index
            </Button>
            <AddCustomIndexDialog assets={assets} closeDialog={closeDialog} />
        </Dialog>
    );
}
