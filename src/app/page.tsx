import {handleGetAllAssetsHistories} from "@/app/db/db.helpers";

export default async function HomePage() {
    try {
        //
        await handleGetAllAssetsHistories();
    } catch (err) {
        console.log(err);
    }

    return <div>Home page</div>;
}
