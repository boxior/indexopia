import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import {handleGenerateDefaultIndexFromScratch} from "@/utils/heleprs/generators/handleGenerateDefaultIndexFromScratch.helper";
import {saveCustomIndex} from "@/app/indexes/[id]/actions";
import {generateUuid} from "@/utils/heleprs/generateUuid.helper";
import {pick} from "lodash";

export const handleSaveDefaultCustomIndex = async (props: {
    upToNumber?: number;
    topAssetsCount?: number;
    defaultIndexBy?: DefaultIndexBy;
    defaultIndexSortBy?: DefaultIndexSortBy;
    startTime?: number | string | Date;
    endTime?: number | string | Date;
}) => {
    const assets = await handleGenerateDefaultIndexFromScratch(props);

    const generatedId = generateUuid();
    await saveCustomIndex({
        id: `default_${props.defaultIndexBy}_${props.defaultIndexSortBy}_${generatedId}`,
        name: `Default by ${props.defaultIndexBy} and ${props.defaultIndexSortBy} (${generatedId})`,
        assets: assets.map(a => pick(a, ["id", "portion"])),
    });
};
