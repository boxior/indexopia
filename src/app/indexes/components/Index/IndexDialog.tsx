"use client";

import {DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {IndexAssets} from "@/app/indexes/components/Index/IndexAssets";
import {IndexAssetsPortions} from "@/app/indexes/components/Index/IndexAssetsPortions";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {Asset, IndexOverview, IndexOverviewAsset} from "@/utils/types/general.types";
import {updateCustomIndex} from "@/app/indexes/[id]/actions";
import {clientApiGetAssets} from "@/utils/clientApi/index.clientApi";

import {getIndexOverviewAsset} from "@/utils/heleprs/index/getIndexOverviewAsset.helper";
import {clientApiCreateIndex} from "@/utils/clientApi/index.clientApi";

// TODO: Define Create/Update helpers for IndexOverview
export function IndexDialog({
    closeDialog,
    indexOverview,
    setLocalData,
}: {
    closeDialog: () => void;
    setLocalData?: React.Dispatch<React.SetStateAction<IndexOverview[]>>;
    indexOverview?: IndexOverview;
}) {
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        (async () => {
            setAssets((await clientApiGetAssets()).assets);
        })();
    }, []);

    const [selectedAssets, setSelectedAssets] = useState<IndexOverviewAsset[]>(indexOverview?.assets ?? []);
    const [name, setName] = useState<string>(indexOverview?.name ?? "");

    const isUpdateMode = !!indexOverview;

    const handleSave = async () => {
        if (isUpdateMode) {
            await updateCustomIndex({
                ...indexOverview,
                name,
                assets: selectedAssets,
            });
        } else {
            const {indexOverview} = await clientApiCreateIndex({
                name,
                assets: selectedAssets.map(getIndexOverviewAsset),
            });

            setLocalData?.(prev => [...prev, indexOverview]);
        }

        closeDialog();
    };

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleChangeMultiselect = (value: IndexOverviewAsset["id"][]) => {
        const assetsToApply = value
            .map(id => {
                const selectedAsset = selectedAssets.find(item => item.id === id);
                const asset = assets.find(item => item.id === id);

                if (!asset) return null;

                return getIndexOverviewAsset({...asset, portion: selectedAsset?.portion ?? 0});
            })
            .filter(a => !!a);

        setSelectedAssets(assetsToApply);
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
                <DialogTitle>{`${isUpdateMode ? "Update" : "Create"} Custom Index ${indexOverview ? `(${indexOverview.name})` : ""}`}</DialogTitle>
                <DialogDescription>{`${isUpdateMode ? "" : "Create your custom Index"}`}</DialogDescription>
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
                    <IndexAssets
                        assets={assets}
                        assetsIds={selectedAssets.map(item => item.id)}
                        onChangeMultiselect={handleChangeMultiselect}
                    />
                </div>
                <div className="grid grid-cols-4 items-baseline gap-4">
                    <Label htmlFor="assets" className="text-right">
                        Assets Portions
                    </Label>
                    <IndexAssetsPortions
                        assets={assets}
                        selectedAssets={selectedAssets}
                        onChangeAssetPortion={handleChangeAssetPortion}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" onClick={handleSave}>
                    {isUpdateMode ? "Update" : "Create"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
