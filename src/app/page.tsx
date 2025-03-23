import {handleGetAllAssetsHistories} from "@/app/db/db.helpers";
import {handleSaveDefaultCustomIndex} from "@/utils/heleprs/generators/handleSaveDefaultCustomIndex.helper";
import {DefaultIndexBy, DefaultIndexSortBy} from "@/utils/types/general.types";

export default async function HomePage() {
    try {
        //
        // return;
        await handleGetAllAssetsHistories();
        // await handleSaveDefaultCustomIndex({
        //     topAssetsCount: 10,
        //     upToNumber: 5,
        //     defaultIndexBy: DefaultIndexBy.RANK,
        //     defaultIndexSortBy: DefaultIndexSortBy.OPTIMAL,
        // });
    } catch (err) {
        console.log(err);
    }

    return <div>Home page</div>;
}
