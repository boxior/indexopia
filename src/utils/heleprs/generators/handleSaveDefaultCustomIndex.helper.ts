import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {handleGenerateDefaultIndexFromScratch} from "@/utils/heleprs/generators/handleGenerateDefaultIndexFromScratch.helper";
import {createCustomIndex} from "@/app/indexes/[id]/actions";
import {pick} from "lodash";

export type SaveDefaultCustomIndexProps = {
    upToNumber?: number;
    topAssetsCount?: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    startTime?: number;
    endTime?: number;
    equalPortions?: boolean;
    name?: string;
};
export const handleSaveDefaultCustomIndex = async (props: SaveDefaultCustomIndexProps) => {
    "use server";
    const {assets, startTime} = await handleGenerateDefaultIndexFromScratch(props);

    await createCustomIndex({
        name: props.name ?? `Default by ${props.defaultIndexBy} and ${props.defaultIndexSortBy}`,
        assets: assets.map(a => pick(a, ["id", "portion"])),
        startTime,
        isSystem: true,
    });
};
