"use client";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {IndexOverview} from "@/utils/types/general.types";
import {useState} from "react";
import {IndexDialog} from "@/app/indexes/components/Index/IndexDialog";
import {redirect} from "next/navigation";
import {isNil} from "lodash";
import {actionDeleteIndexOverview} from "@/app/indexes/[id]/actions";

export function UpdateIndex({indexOverview}: {indexOverview: IndexOverview}) {
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

    const doDelete = !isNil(indexOverview?.id) && !indexOverview?.isSystem;

    const handleDelete = async () => {
        if (!doDelete) {
            return;
        }
        await actionDeleteIndexOverview(indexOverview?.id ?? ""); // need tls
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
                {open && <IndexDialog closeDialog={closeDialog} indexOverview={indexOverview} />}
            </Dialog>
        </>
    );
}
