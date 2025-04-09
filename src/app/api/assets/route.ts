import {NextResponse, NextRequest} from "next/server";
import {insertAssets} from "@/lib/db";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";

/**
 * Write `assets` to the DB
 */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {limit?: number};
        const limit = body.limit ?? MAX_ASSET_COUNT + OMIT_ASSETS_IDS.length;

        const assets = await fetchAssets({limit});
        await insertAssets(assets);

        return NextResponse.json(
            {data: assets},
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {data: JSON.parse(JSON.stringify(error))},
            {
                status: 400,
            }
        );
    }
}
