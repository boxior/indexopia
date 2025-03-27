import {Button} from "@/components/ui/button";
import {
    handleSaveDefaultCustomIndex,
    SaveDefaultCustomIndexProps,
} from "@/utils/heleprs/generators/handleSaveDefaultCustomIndex.helper";
import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";
import momentTimeZone from "moment-timezone";

export async function DefaultCustomIndex() {
    const props: SaveDefaultCustomIndexProps = {
        topAssetsCount: 10,
        upToNumber: 5,
        defaultIndexBy: DefaultIndexBy.RANK,
        defaultIndexSortBy: DefaultIndexSortBy.PROFIT,
        startTime: momentTimeZone.tz("UTC").subtract(5, "y").valueOf(),
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
