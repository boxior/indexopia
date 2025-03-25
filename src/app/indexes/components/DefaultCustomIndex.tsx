import {Button} from "@/components/ui/button";
import {
    handleSaveDefaultCustomIndex,
    SaveDefaultCustomIndexProps,
} from "@/utils/heleprs/generators/handleSaveDefaultCustomIndex.helper";
import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";

// TODO:
// Make start/end time workable
// Correct Optimal logic
export async function DefaultCustomIndex() {
    console.log("START_TIME", momentTimeZone.tz("UTC").subtract(3, "year").valueOf());
    const props: SaveDefaultCustomIndexProps = {
        topAssetsCount: 5,
        upToNumber: 5,
        defaultIndexBy: DefaultIndexBy.RANK_AND_EXTRA,
        defaultIndexSortBy: DefaultIndexSortBy.MAX_DRAW_DOWN,
        startTime: momentTimeZone.tz("UTC").subtract(2, "y").valueOf(),
    };
    const handleIndex = async () => {
        "use server";
        await handleSaveDefaultCustomIndex(props);
    };
    return (
        <div>
            <Button onClick={handleIndex}>Generate Default Custom Index</Button>
            <div>
                {JSON.stringify(
                    {
                        ...props,
                        startTime: momentTimeZone.tz(props.startTime, "UTC").toISOString(),
                        dateStartTime: new Date(props.startTime ?? 0).toISOString(),
                    },
                    null,
                    2
                )}
            </div>
        </div>
    );
}
