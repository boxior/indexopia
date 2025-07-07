"use server";
import {signIn} from "@/auth";

export const actionSignIn = async (email: string) => {
    await signIn("resend", {email});
};
