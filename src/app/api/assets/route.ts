import {NextResponse, NextRequest} from "next/server";
import {manageAssets} from "@/lib/db/helpers/db.helpers";
import {ENV_VARIABLES} from "@/env";
import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";
export const dynamic = "force-dynamic";

/**
 * Write `assets` to the DB.
 * The request should be GET to use free cron job https://console.cron-job.org/dashboard
 */
export async function POST(_req: NextRequest) {
    try {
        // Get the URL and search parameters
        const {searchParams} = new URL(_req.url);

        // Retrieve the apiKey from the query string
        const apiKey = searchParams.get("apiKey");

        if (!apiKey) {
            return NextResponse.json({error: "API key is missing"}, {status: 401});
        }

        // Validate the API key
        if (apiKey !== ENV_VARIABLES.API_KEY) {
            return NextResponse.json({error: "Invalid API key"}, {status: 403});
        }

        await manageAssets();

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

export async function GET(_req: NextRequest) {
    try {
        // Get the URL and search parameters
        const {searchParams} = new URL(_req.url);

        // Retrieve the apiKey from the query string
        const apiKey = searchParams.get("apiKey");

        if (!apiKey) {
            return NextResponse.json({error: "API key is missing"}, {status: 401});
        }

        // Validate the API key
        if (apiKey !== ENV_VARIABLES.API_KEY) {
            return NextResponse.json({error: "Invalid API key"}, {status: 403});
        }

        const assets = await dbGetAssets();

        return NextResponse.json(
            {assets},
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
