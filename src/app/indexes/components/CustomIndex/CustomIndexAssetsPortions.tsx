import {CustomIndexAsset, Asset} from "@/utils/types/general.types";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ChangeEventHandler} from "react";

const MAX_PORTION = 100;

export function CustomIndexAssetsPortions({
    assets,
    selectedAssets,
    onChangeAssetPortion,
}: {
    assets: Asset[];
    selectedAssets: CustomIndexAsset[];
    onChangeAssetPortion: (id: string, portion: number) => void;
}) {
    const handleChangePortion =
        (assetId: string): ChangeEventHandler<HTMLInputElement> =>
        e => {
            onChangeAssetPortion(assetId, Number(e.target.value));
        };

    const sum = selectedAssets.reduce((acc, asset) => acc + asset.portion, 0);

    return (
        <div className="col-span-3 gap-4">
            {selectedAssets.map(({id: assetId, portion}) => {
                const asset = assets.find(item => item.id === assetId);

                return (
                    <div key={assetId} className="grid grid-cols-4 items-center gap-4 py-1">
                        <Label htmlFor={`portion_${assetId}`} className="text-right opacity-50 col-span-3">
                            {asset?.name}
                        </Label>
                        <Input id={`portion_${assetId}`} value={portion} onChange={handleChangePortion(assetId)} />
                    </div>
                );
            })}
            <div className="grid grid-cols-4 items-center gap-4 py-1">
                <Label htmlFor="assets" className="text-right opacity-50 col-span-3">
                    Total
                </Label>
                <div
                    className={`${sum === MAX_PORTION ? "text-green-500" : "text-red-500"}`}
                >{`${sum} / ${MAX_PORTION}`}</div>
            </div>
        </div>
    );
}
