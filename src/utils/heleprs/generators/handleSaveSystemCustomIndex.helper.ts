import {SystemIndexBy, SystemIndexSortBy} from "@/utils/types/general.types";
import {handleGenerateSystemIndexFromScratch} from "@/utils/heleprs/generators/handleGenerateSystemIndexFromScratch.helper";
import {createCustomIndex} from "@/app/indexes/[id]/actions";
import {pick} from "lodash";

export type SaveSystemCustomIndexProps = {
    upToNumber?: number;
    topAssetsCount?: number;
    systemIndexBy?: SystemIndexBy;
    systemIndexSortBy?: SystemIndexSortBy;
    startTime?: number;
    endTime?: number;
    equalPortions?: boolean;
    name?: string;
};
export const handleSaveSystemCustomIndex = async (props: SaveSystemCustomIndexProps) => {
    "use server";
    const {assets, startTime} = await handleGenerateSystemIndexFromScratch(props);

    await createCustomIndex({
        name: props.name ?? `Default by ${props.systemIndexBy} and ${props.systemIndexSortBy}`,
        assets: assets.map(a => pick(a, ["id", "portion"])),
        startTime,
        isSystem: true,
    });
};
