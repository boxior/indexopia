import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {manageAssetHistory} from "@/app/api/api.helpers";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";

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

        const ID = "lido-finance-wsteth";
        // const ID = "bitcoin";
        const history = await manageAssetHistory({id: ID});

        await writeJsonFile(ID, history, "/db/raw-history");

        return NextResponse.json(
            {data: history},
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
