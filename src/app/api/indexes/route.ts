import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {handleSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";
import {IndexOverviewAsset, SaveSystemIndexProps} from "@/utils/types/general.types";
import {actionCreateIndexOverview} from "@/app/indices/[id]/actions";

export const dynamic = "force-dynamic";

/**
 * Generate Index
 */
export async function POST(req: NextRequest) {
    try {
        // Get the URL and search parameters
        const {searchParams} = new URL(req.url);

        // Retrieve the apiKey from the query string
        const systemId = searchParams.get("systemId");

        if (systemId) {
            const body = (await req.json()) as SaveSystemIndexProps;
            const indexOverview = await handleSaveSystemIndex(body, searchParams);
            return NextResponse.json(
                {indexOverview},
                {
                    status: 200,
                }
            );
        } else {
            const body = (await req.json()) as {name: string; assets: IndexOverviewAsset[]};
            const indexOverview = await actionCreateIndexOverview(body);

            return NextResponse.json(
                {indexOverview},
                {
                    status: 200,
                }
            );
        }
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

const handleSaveSystemIndex = async (body: SaveSystemIndexProps, searchParams: URLSearchParams) => {
    const apiKey = searchParams.get("apiKey");

    if (!apiKey) {
        return NextResponse.json({error: "API key is missing"}, {status: 401});
    }

    // Validate the API key
    if (apiKey !== ENV_VARIABLES.API_KEY) {
        return NextResponse.json({error: "Invalid API key"}, {status: 403});
    }

    return await handleSaveSystemIndexOverview(body);
};
