import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import fetchAssetHistory from "@/app/actions/assets/fetchAssetHistory";
import moment from "moment";
import {AssetHistory} from "@/utils/types/general.types";

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

        const ID = "polygon";
        // const ID = "bitcoin";
        const start = moment().utc().startOf("day").add(-5, "days").valueOf();
        const end = moment().utc().startOf("day").valueOf();
        const lastHistoryBefore: AssetHistory = {
            assetId: ID,
            priceUsd: "0.52126034102192210769",
            time: 1531180800000,
            date: "2018-07-10T00:00:00.000Z",
        };
        const history = await fetchAssetHistory({lastHistoryBefore, id: ID, interval: "d1", start, end});
        // const history = await manageAssetHistory({id: ID});
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
