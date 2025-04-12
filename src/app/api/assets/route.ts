import {NextResponse, NextRequest} from "next/server";
import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import {manageAssets} from "@/lib/db/helpers/db.helpers";

/**
 * Write `assets` to the DB.
 * The request should be GET to use free cron job https://console.cron-job.org/dashboard
 */
export async function GET(_req: NextRequest) {
    try {
        const limit = MAX_ASSET_COUNT + OMIT_ASSETS_IDS.length;

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
