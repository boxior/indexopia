"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Asset, CustomIndexType} from "@/utils/types/general.types";
import {useState} from "react";
import {CustomIndexDialog} from "@/app/indexes/components/CustomIndex/CustomIndexDialog";
import {clientApiDeleteCustomIndex} from "@/utils/clientApi/customIndex.clientApi";
import {redirect} from "next/navigation";
import {isNil} from "lodash";

export function UpdateCustomIndex({assets, customIndex}: {assets: Asset[]; customIndex: CustomIndexType}) {
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

    const doDelete = !isNil(customIndex?.id) && !customIndex?.isDefault;

    const handleDelete = async () => {
        if (!doDelete) {
            return;
        }
        await clientApiDeleteCustomIndex(customIndex?.id ?? ""); // need tls
        redirect("/indexes");
    };

    return (
        <>
            <div>
                <Button variant="outline" onClick={openDialog}>
                    Update
                </Button>
                {doDelete && (
                    <Button variant="outline" type={"button"} onClick={handleDelete}>
                        Delete
                    </Button>
                )}
            </div>
            <Dialog open={open} onOpenChange={onOpenChange}>
                {open && <CustomIndexDialog assets={assets} closeDialog={closeDialog} customIndex={customIndex} />}
            </Dialog>
        </>
    );
}
