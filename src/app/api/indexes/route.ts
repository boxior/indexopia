import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {SaveSystemIndexProps} from "@/utils/heleprs/generators/handleSaveSystemCustomIndex.helper";
import {handleSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";
import {dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {
    AssetWithHistoryOverviewPortionAndMaxDrawDown,
    IndexOverview,
    IndexOverviewAsset,
} from "@/utils/types/general.types";
import {getAssetsWithHistories, getIndexHistory, getIndexHistoryOverview} from "@/lib/db/helpers/db.helpers";
import {getMaxDrawDownWithTimeRange} from "@/utils/heleprs/generators/drawdown/sortLessDrawDownIndexAssets.helper";

export const dynamic = "force-dynamic";

/**
 * Generate Default Custom Indexes
 */
export async function POST(req: NextRequest) {
    try {
        // Get the URL and search parameters
        const {searchParams} = new URL(req.url);

        // Retrieve the apiKey from the query string
        const isSystem = searchParams.get("isSystem") === "true";
        console.log("isSystem", isSystem);
        if (isSystem) {
            const body = (await req.json()) as SaveSystemIndexProps;
            return await handleSaveSystemIndex(body, searchParams);
        } else {
            const body = (await req.json()) as {name: string; assets: IndexOverviewAsset[]};
            return await handleCreateIndexOverview(body);
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

    await handleSaveSystemIndexOverview(body);

    return NextResponse.json(
        {success: true},
        {
            status: 200,
        }
    );
};

const handleCreateIndexOverview = async ({name, assets: propAssets}: Pick<IndexOverview, "name" | "assets">) => {
    const systemId = "";

    let assets = [];

    const {assets: assetsWithHistories, startTime} = await getAssetsWithHistories({
        assets: propAssets,
    });

    assets = assetsWithHistories;

    assets = assets.map(asset => ({
        ...asset,
        portion: propAssets.find(a => a.id === asset.id)?.portion ?? 0,
        maxDrawDown: getMaxDrawDownWithTimeRange(asset.history),
    }));

    const index = {
        name,
        assets: assets as AssetWithHistoryOverviewPortionAndMaxDrawDown[],
    };

    const history = await getIndexHistory(index);
    const historyOverview = await getIndexHistoryOverview(index.assets);
    const maxDrawDown = getMaxDrawDownWithTimeRange(history);

    const indexOverview = await dbPostIndexOverview({systemId, name, assets, historyOverview, maxDrawDown, startTime});

    return NextResponse.json(
        {indexOverview},
        {
            status: 200,
        }
    );
};
