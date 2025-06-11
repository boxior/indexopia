import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {MAX_ASSET_COUNT, OMIT_ASSETS_IDS} from "@/utils/constants/general.constants";
import {manageAssets, manageAssetsHistory} from "@/lib/db/helpers/db.helpers";
export const dynamic = "force-dynamic";

/**
 * Generate Default Custom Indexes
 */
export async function POST(req: NextRequest) {
    try {
        // Get the URL and search parameters
        const {searchParams} = new URL(req.url);

        // Retrieve the apiKey from the query string
        const apiKey = searchParams.get("apiKey");

        if (!apiKey) {
            return NextResponse.json({error: "API key is missing"}, {status: 401});
        }

        // Validate the API key
        if (apiKey !== ENV_VARIABLES.API_KEY) {
            return NextResponse.json({error: "Invalid API key"}, {status: 403});
        }

        // Assets
        await manageAssets();

        // Assets history
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
