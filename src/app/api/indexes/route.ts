import {NextRequest, NextResponse} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {SaveDefaultCustomIndexProps} from "@/utils/heleprs/generators/handleSaveDefaultCustomIndex.helper";
import {handleCreateIndex} from "@/utils/heleprs/index/index.helpers";
import {IndexId} from "@/utils/types/general.types";
import {INDEX_NAME_BY_INDEX_ID} from "@/utils/constants/general.constants";
import {getCachedTopAssets} from "@/lib/db/helpers/db.helpers";

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

        const body = (await req.json()) as SaveDefaultCustomIndexProps;

        // await handleSaveDefaultCustomIndex(body);

        const assets = await getCachedTopAssets();
        await handleCreateIndex({
            id: IndexId.TOP_5,
            name: INDEX_NAME_BY_INDEX_ID[IndexId.TOP_5],
            assetIds: assets.slice(0, 5).map(a => a.id),
            isSystem: true,
        });

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
