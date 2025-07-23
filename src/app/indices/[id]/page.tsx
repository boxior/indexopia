import {connection} from "next/server";
import {getIndex} from "@/lib/db/helpers/db.helpers";
import {IndexPageClient} from "@/app/indices/[id]/components/CLAUD_WEB/IndexPageClient";

interface PageProps {
    params: Promise<{id: string}>;
}

export default async function Page({params}: PageProps) {
    await connection();

    const {id} = await params;
    const index = await getIndex({
        id,
    });

    return <IndexPageClient index={index} />;
}
