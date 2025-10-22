import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
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

        const id = "cardano";
        const start = moment("2023-10-17T00:00:00.000Z").utc().startOf("day").valueOf();
        const end = moment("2025-10-18T00:00:00.000Z").utc().startOf("day").valueOf();
        const lastHistoryBefore: AssetHistory = {
            assetId: id,
            priceUsd: "0.52126034102192210769",
            time: 1531180800000,
            date: "2018-07-10T00:00:00.000Z",
        };

        // const timeRanges = splitTimeRangeByYear(start, end);
        // const history = await fetchAssetHistory({lastHistoryBefore, id, interval: "d1", start, end});
        // const history = await manageAssetHistory({id, fromScratch: true});
        // const assets = await dbGetAssets();

        // const history = await manageAssetsHistory(assets);

        return NextResponse.json(
            {
                data: [],
                // data: timeRanges.map(range => ({
                //     start: moment(range.start).toISOString(),
                //     end: moment(range.end).toISOString(),
                //     days: getDaysArray(range.start, range.end).length,
                // })),
            },
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
