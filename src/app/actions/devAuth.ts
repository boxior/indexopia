"use server";

import {cookies} from "next/headers";
import {ENV_VARIABLES} from "@/env";
import {redirect} from "next/navigation";
import {DEV_AUTH_NAME, DEV_AUTH_PATH} from "@/utils/constants/general.constants";

const DEV_API_KEY = ENV_VARIABLES.NEXT_PUBLIC_DEV_API_KEY;

export async function devAuth(apiKey: string) {
    "use server";

    if (!(await getIsLocalOrDev())) {
        return {success: true};
    }

    if (apiKey === DEV_API_KEY) {
        (await cookies()).set(DEV_AUTH_NAME, apiKey, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        return {success: true};
    }

    return {success: false, message: "Invalid API Key"};
}

export async function devAuthCheck() {
    "use server";

    if (!(await getIsLocalOrDev())) {
        return true;
    }

    const authCookie = (await cookies()).get(DEV_AUTH_NAME);
    return authCookie?.value === DEV_API_KEY;
}

export async function getIsLocalOrDev() {
    "use server";
    return ENV_VARIABLES.MY_ENV === "development" || ENV_VARIABLES.MY_ENV === "local";
}

export async function handleDevAuthRedirect() {
    "use server";
    const isDevAuth = await devAuthCheck();

    if (!isDevAuth) {
        return redirect(DEV_AUTH_PATH);
    }

    return redirect("/");
}
