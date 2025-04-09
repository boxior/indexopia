import {NextResponse, NextRequest} from "next/server";
import {manageAssetsHistories} from "@/app/db/db.helpers";

/**
 * Write `assets_history` to the DB
 */
export async function POST(_req: NextRequest) {
    try {
        // await manageAssetsHistories();

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
