import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {manageAssets, manageAssetsHistory} from "@/app/api/api.helpers";
import {manageSystemIndices} from "@/lib/db/helpers/db.indexOverview.helpers";

export const dynamic = "force-dynamic";

/**
 * Populate entities: Assets, History, and Indices
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
        const allAssets = await manageAssets();

        // Assets history
        const allAssetsHistory = await manageAssetsHistory();

        await manageSystemIndices(allAssets, allAssetsHistory);
        return NextResponse.json(
            {success: true},
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {data: JSON.parse(JSON.stringify(error))},
            {
                status: 400,
            }
        );
    }
}
