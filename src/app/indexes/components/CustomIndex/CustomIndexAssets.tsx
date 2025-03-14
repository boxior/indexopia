import React from "react";
import {MultiSelect} from "@/components/custom-ui/multiselect";
import {Asset} from "@/utils/types/general.types";

export function CustomIndexAssets({
    assets,
    assetsIds,
    onChangeMultiselect,
}: {
    assets: Asset[];
    assetsIds: string[];
    onChangeMultiselect: (value: string[]) => void;
}) {
    const options = assets.map(item => ({value: item.id, label: item.name}));

    return (
        <MultiSelect
            id={"assets"}
            className="col-span-3"
            options={options}
            onValueChange={onChangeMultiselect}
            defaultValue={assetsIds}
            placeholder="Select Assets..."
            variant="inverted"
            animation={2}
            maxCount={3}
        />
    );
}
