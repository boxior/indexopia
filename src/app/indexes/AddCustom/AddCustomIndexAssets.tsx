"use client";

import React, {useState} from "react";
import {MultiSelect} from "@/components/custom-ui/multiselect";
import {Asset} from "@/utils/types/general.types";

export function AddCustomIndexAssets({assets}: {assets: Asset[]}) {
    const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(["react", "angular"]);

    const options = assets.map(item => ({value: item.id, label: item.name}));

    return (
        <MultiSelect
            id={"assets"}
            className="col-span-3"
            options={options}
            onValueChange={setSelectedFrameworks}
            value={selectedFrameworks}
            placeholder="Select Assets"
            variant="inverted"
            animation={2}
            maxCount={3}
        />
    );
}
