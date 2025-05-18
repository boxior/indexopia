import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {handleGenerateDefaultIndexFromScratch} from "@/utils/heleprs/generators/handleGenerateDefaultIndexFromScratch.helper";
import {saveCustomIndex} from "@/app/indexes/[id]/actions";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
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

    const generatedId = generateUuid();
    await saveCustomIndex({
        id: generatedId,
        name: props.name ?? `Default by ${props.defaultIndexBy} and ${props.defaultIndexSortBy} (${generatedId})`,
        assets: assets.map(a => pick(a, ["id", "portion"])),
        startTime,
        isDefault: true,
    });
};
