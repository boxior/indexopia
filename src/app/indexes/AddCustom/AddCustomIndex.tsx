"use client";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AddCustomIndexAssets} from "@/app/indexes/AddCustom/AddCustomIndexAssets";
import {Asset} from "@/utils/types/general.types";
import {useState} from "react";
import {saveCustomIndex} from "@/app/indexes/[id]/actions";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";

export function AddCustomIndex({assets}: {assets: Asset[]}) {
    const [assetsIds, setAssetsIds] = useState<string[]>(["react", "angular"]);
    const [name, setName] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        await saveCustomIndex({id: generateUuid(), name, assetsIds});
        closeDialog();
    };

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    return (
        <Dialog open={open}>
            <Button variant="outline" onClick={openDialog}>
                Add Index
            </Button>
            <DialogContent className="w-full max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Index</DialogTitle>
                    <DialogDescription>Create your custom Index</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Index Name..."
                            className="col-span-3"
                            value={name}
                            onChange={handleChangeName}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assets" className="text-right">
                            Assets
                        </Label>
                        <AddCustomIndexAssets
                            assets={assets}
                            selectedFrameworks={assetsIds}
                            setSelectedFrameworks={setAssetsIds}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSave}>
                        Add Index
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
