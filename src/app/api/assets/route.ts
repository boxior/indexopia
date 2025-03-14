/**
 * Example of Server Requests
 */
// To handle a GET request to /api/posts
import {NextResponse} from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
    return NextResponse.json(
        {a: "b"},
        {
            status: 200,
        }
    );
}
