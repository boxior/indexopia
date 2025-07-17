import {IndexPageClient} from "@/app/indices/[id]/components/CLAUD/IndexPageClient";
import {Index} from "@/utils/types/general.types";
import {connection} from "next/server";
import {getIndex} from "@/lib/db/helpers/db.helpers";

// This would be your data fetching function
async function getIndexData(id: string): Promise<Index> {
    // Fetch your index data here
    // This is just a placeholder
    throw new Error("Implement your data fetching logic");
}

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
