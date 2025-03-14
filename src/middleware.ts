import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {devAuthCheck} from "@/app/actions/devAuth";
import {DEV_AUTH_NAME, DEV_AUTH_PATH} from "@/utils/constants/general.constants";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const isDevAuth = await devAuthCheck();
    const isDevAuthPath = request.nextUrl.pathname.includes(DEV_AUTH_NAME);
    const doRedirect = !isDevAuth && !isDevAuthPath;

    if (doRedirect) {
        return NextResponse.redirect(new URL(DEV_AUTH_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/((?!_next|dev-auth).*)", // Exclude _next (static assets) and API calls
};
