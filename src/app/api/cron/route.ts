import {NextRequest, NextResponse} from "next/server";
import {populateDb} from "@/app/api/api.helpers";

export async function GET(req: NextRequest) {
    if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json("Unauthorized", {status: 401});
    }

    return await populateDb();
}
