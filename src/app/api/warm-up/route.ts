import {NextResponse, NextRequest} from "next/server";
import {ENV_VARIABLES} from "@/env";

/**
 * It's necessary to warm up the Vercel server;
 */

const handleRequest = async (req: NextRequest) => {
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

        return NextResponse.json(
            {success: true, date: new Date().toISOString()},
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
};

/**
 * It's necessary to have POST request if here is the GET request to avoid pre-render issue during build project.
 */
export async function POST(req: NextRequest) {
    await handleRequest(req);
}

export async function GET(req: NextRequest) {
    await handleRequest(req);
}
