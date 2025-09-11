import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";
import {revalidatePath} from "next/cache";
export const dynamic = "force-dynamic";

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

        const {path} = (await req.json()) as {path: string};
        // Assets
        revalidatePath(path);

        return NextResponse.json(
            {success: true, path},
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
