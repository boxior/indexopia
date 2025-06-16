"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {useState} from "react";
import {IndexDialog} from "@/app/indexes/components/Index/IndexDialog";

export function CreateIndex() {
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
                Create Custom Index
            </Button>
            {open && <IndexDialog closeDialog={closeDialog} />}
        </Dialog>
    );
}
