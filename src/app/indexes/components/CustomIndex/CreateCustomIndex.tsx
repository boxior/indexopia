"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Asset} from "@/utils/types/general.types";
import {useState} from "react";
import {CustomIndexDialog} from "@/app/indexes/components/CustomIndex/CustomIndexDialog";

export function CreateCustomIndex({assets}: {assets: Asset[]}) {
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
                Crate Custom Index
            </Button>
            {open && <CustomIndexDialog assets={assets} closeDialog={closeDialog} />}
        </Dialog>
    );
}
