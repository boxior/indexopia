import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import moment from "moment";
import {AssetHistory} from "@/utils/types/general.types";
import {writeJsonFile} from "@/utils/heleprs/fs.helpers";
import {dbGetAssets} from "@/lib/db/helpers/db.assets.helpers";

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

        const id = "terra-virtua-kolect";
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
        const assets = await dbGetAssets();

        // const history = await manageAssetsHistory(assets);

        let missedHistory: Record<string, unknown> = {};
        //

        // await Promise.all(
        //     assets.slice(-10).map(async asset => {
        //         const history = await dbGetMissedAssetHistoryRangesById({assetId: asset.id});
        //
        //         if (history.ranges.length) {
        //             missedHistory[asset.id] = history;
        //             await writeJsonFile(`${asset.id}_${history.ranges.length}`, history, "/db/missedHistory");
        //         }
        //     })
        // );
        // const chunks = chunk(assets, 10);
        //
        // for (const chunk of chunks) {
        //     await Promise.all(
        //         chunk.map(async asset => {
        //             const history = await dbGetMissedAssetHistoryRangesById({assetId: asset.id});
        //
        //             if (history.ranges.length) {
        //                 missedHistory[asset.id] = history;
        //                 await writeJsonFile(`${asset.id}_${history.ranges.length}`, history, "/db/missedHistory");
        //             }
        //         })
        //     );
        // }
        // for (const asset of assets.slice(-10)) {
        //     const history = await dbGetMissedAssetHistoryRangesById({assetId: asset.id});
        //
        //     if (history.ranges.length) {
        //         missedHistory[asset.id] = history;
        //         await writeJsonFile(`${asset.id}_${history.ranges.length}`, history, "/db/missedHistory");
        //     }
        // }

        const keys = Object.keys(missedHistory);
        await writeJsonFile(`keys`, {keys}, "/db/missedHistory");

        // TODO: Script to:
        // Get all missed ranges per asset
        // Populate missed ranges
        // const history = await dbGetMissedAssetHistoryRangesById({assetId: id});
        //
        // if (history.ranges.length) {
        //     missedHistory[id] = history;
        //     await writeJsonFile(`${id}_${history.ranges.length}`, history, "/db/missedHistory");
        // }

        // const assetsIds = [
        //     "unus-sed-leo",
        //     "terra-luna",
        //     "storj",
        //     "power-ledger",
        //     "ardor",
        //     "orbs",
        //     "aragon",
        //     "neblio",
        //     "dusk-network",
        //     "babyswap",
        // ];
        //
        // for (const assetId of assetsIds) {
        //     await manageAssetHistory({id: assetId, fromScratch: true});
        // }

        return NextResponse.json(
            {
                data: missedHistory,
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
