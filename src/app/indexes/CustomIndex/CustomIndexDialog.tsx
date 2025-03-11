import {DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {CustomIndexAssets} from "@/app/indexes/CustomIndex/CustomIndexAssets";
import {CustomIndexAssetsPortions} from "@/app/indexes/CustomIndex/CustomIndexAssetsPortions";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {CustomIndexAsset, Asset, CustomIndexType} from "@/utils/types/general.types";
import {saveCustomIndex} from "@/app/indexes/[id]/actions";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";

export function CustomIndexDialog({
    assets,
    closeDialog,
    customIndex,
}: {
    assets: Asset[];
    closeDialog: () => void;
    customIndex?: CustomIndexType;
}) {
    const [selectedAssets, setSelectedAssets] = useState<CustomIndexAsset[]>(customIndex?.assets ?? []);
    const [name, setName] = useState<string>(customIndex?.name ?? "");

    const handleSave = async () => {
        await saveCustomIndex({id: customIndex?.id ?? generateUuid(), name, assets: selectedAssets});
        closeDialog();

        customIndex && window.location.reload();
    };

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleChangeMultiselect = (value: CustomIndexAsset["id"][]) => {
        setSelectedAssets(
            value.map(id => {
                const selectedAsset = selectedAssets.find(item => item.id === id);

                return {id, portion: selectedAsset?.portion ?? 0};
            })
        );
    };

    const handleChangeAssetPortion = (assetId: string, portion: number) => {
        setSelectedAssets(prev =>
            prev.map(asset => {
                if (asset.id === assetId) {
                    return {...asset, portion};
                }
                return asset;
            })
        );
    };

    return (
        <DialogContent className="w-full max-w-lg">
            <DialogHeader>
                <DialogTitle>{`${customIndex ? "Edit" : "Create"} Custom Index ${customIndex ? `(${customIndex.name})` : ""}`}</DialogTitle>
                <DialogDescription>{`${customIndex ? "" : "Create your custom Index"}`}</DialogDescription>
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
                    <CustomIndexAssets
                        assets={assets}
                        assetsIds={selectedAssets.map(item => item.id)}
                        onChangeMultiselect={handleChangeMultiselect}
                    />
                </div>
                <div className="grid grid-cols-4 items-baseline gap-4">
                    <Label htmlFor="assets" className="text-right">
                        Assets Portions
                    </Label>
                    <CustomIndexAssetsPortions
                        assets={assets}
                        selectedAssets={selectedAssets}
                        onChangeAssetPortion={handleChangeAssetPortion}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" onClick={handleSave}>
                    Add Index
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
