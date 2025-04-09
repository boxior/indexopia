import {NextResponse, NextRequest} from "next/server";
import {insertAssets} from "@/lib/db";
import fetchAssets from "@/app/actions/assets/fetchAssets";
import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";

/**
 * Write `assets` to the DB
 */
export async function POST(req: NextRequest) {
    try {
        let body = {} as {limit?: number};
        try {
            body = (await req.json()) as {limit?: number};
        } catch {
            //
        }

        const limit = body?.limit ?? MAX_ASSET_COUNT + OMIT_ASSETS_IDS.length;

        const {data} = await fetchAssets({limit});

        await insertAssets(data);

        return NextResponse.json(
            {data: []},
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
