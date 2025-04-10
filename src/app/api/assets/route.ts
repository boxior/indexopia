import {NextResponse, NextRequest} from "next/server";
import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import {manageAssets} from "@/lib/db/helpers/db.helpers";

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

        await manageAssets({limit});

        return NextResponse.json(
            {success: true},
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
