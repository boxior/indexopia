import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {devAuthCheck} from "@/app/actions/devAuth";
import {DEV_AUTH_PATH} from "@/utils/constants/general.constants";

export async function devAuthMiddleware(request: NextRequest) {
    const isDevAuth = await devAuthCheck();

    if (!isDevAuth) {
        return NextResponse.redirect(new URL(DEV_AUTH_PATH, request.url));
    }

    return NextResponse.next();
}
