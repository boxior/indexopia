import {NextResponse, NextRequest} from "next/server";
import {manageAssetsHistory} from "@/lib/db/helpers/db.helpers";

/**
 * Write `assets_history` to the DB
 * The request should be GET to use free cron job https://console.cron-job.org/dashboard
 */
export async function GET(_req: NextRequest) {
    try {
        await manageAssetsHistory();

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
