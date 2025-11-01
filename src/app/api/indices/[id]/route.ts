import {NextResponse, NextRequest} from "next/server";
import {actionGetIndex} from "@/app/[locale]/indices/[id]/actions";

/**
 * Get index with history overview.
 */
export async function GET(_req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params; // 👈 Extracted directly from the URL: /posts/{id}
        const fetchedIndexWithHistory = await actionGetIndex({id});

        return NextResponse.json(fetchedIndexWithHistory, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: JSON.parse(JSON.stringify(error))}, {status: 400});
    }
}
