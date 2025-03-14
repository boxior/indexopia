import {handleGetAllAssets, handleGetAllAssetsHistories, handleGetAssetHistory} from "@/app/api/assets/db.helpers";
import getAssetHistory from "@/app/api/assets/getAssetHistory";

export default async function Home() {
    try {
        //
        // await handleGetAllAssetsHistories();
        // await handleGetAssetHistory({id: "binance-coin"});
    } catch (err) {
        console.log(err);
    }

    return <div>Home page</div>;
}
