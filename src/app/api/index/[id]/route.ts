import {NextResponse, NextRequest} from "next/server";
import {dbDeleteSystemIndex} from "@/lib/db/helpers/db.customIndex.helpers";

export const dynamic = "force-dynamic";

/**
 * Write `assets_history` to the DB
 * The request should be GET to use free cron job https://console.cron-job.org/dashboard
 */
export async function DELETE(req: NextRequest) {
    try {
        const urlParts = req.nextUrl.pathname.split("/");
        const id = urlParts[urlParts.length - 1]; // Get the last part of the path

        await dbDeleteSystemIndex(id);

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
