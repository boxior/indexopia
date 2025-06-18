import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {handlePrepareToSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";
import {SYSTEM_INDEXES_PROPS} from "@/app/api/populate/populate.constants";
import {chunk} from "lodash";
import {dbDeleteSystemIndexes, dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {Asset, AssetHistory} from "@/utils/types/general.types";
import {MAX_ASSET_COUNT} from "@/utils/constants/general.constants";
import {sortRankIndexAssets} from "@/utils/heleprs/generators/rank/sortRankIndexAssets.helper";
import {manageSystemIndexes} from "@/lib/db/helpers/db.index.helpers";

export const dynamic = "force-dynamic";

/**
 * Populate System Indexes
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

        // Indexes
        await manageSystemIndexes();

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
