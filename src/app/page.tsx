import {handleGetAllAssets, handleGetAllAssetsHistories, handleGetAssetHistory} from "@/app/api/assets/db.helpers";

export default async function Home() {
    try {
        //
        await handleGetAssetHistory({id: "bittensor"});
    } catch (err) {
        console.log("ERRRORRRRR", JSON.parse(JSON.stringify(err)));
    }

    return <div>Home page</div>;
}
