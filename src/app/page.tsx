import {Suspense} from "react";

export default async function HomePage() {
    try {
        //
    } catch (err) {
        console.log(err);
    }

    return <Suspense fallback={<div>Loading...</div>}>Home page</Suspense>;
}
