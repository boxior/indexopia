import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {handlePrepareToSaveSystemIndexOverview} from "@/utils/heleprs/generators/handleSaveSystemIndexOverview.helper";
import {SYSTEM_INDEXES_PROPS} from "@/app/api/populate/populate.constants";
import {chunk} from "lodash";
import {dbDeleteSystemIndexes, dbPostIndexOverview} from "@/lib/db/helpers/db.indexOverview.helpers";

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

// TODO: fix system indexes managing: WE have timeout 60 sec on Versel.
// Split up to a couple of cron jobs execution.
// add ids to the System Indexes to delete them grararly
const manageSystemIndexes = async () => {
    try {
        const indexesToSave = [];

        const chunks = chunk(SYSTEM_INDEXES_PROPS, 10);
        for (const chunk of chunks) {
            const chunkIndexes = await Promise.all(chunk.map(item => handlePrepareToSaveSystemIndexOverview(item)));

            indexesToSave.push(...chunkIndexes);
        }

        await dbDeleteSystemIndexes();
        const chunksToSave = chunk(indexesToSave, 10);
        for (const chunkToSave of chunksToSave) {
            await Promise.all(chunkToSave.map(item => dbPostIndexOverview(item)));
        }
    } catch (error) {
        console.log(error);
    }
};
