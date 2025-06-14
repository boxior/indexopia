"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Asset} from "@/utils/types/general.types";
import {useEffect, useState} from "react";
import {CustomIndexDialog} from "@/app/indexes/components/CustomIndex/CustomIndexDialog";
import {clientApiGetAssets} from "@/utils/clientApi/customIndex.clientApi";

export function CreateCustomIndex() {
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        (async () => {
            setAssets((await clientApiGetAssets()).assets);
        })();
    }, []);

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
