"use server";
import {auth, signOut} from "@/auth";
import {PATH_URLS} from "@/utils/constants/general.constants";

export const authSignOut = async () => {
    await signOut({redirectTo: PATH_URLS.signIn});
};

export const getAuthSession = async () => {
    return await auth();
};
