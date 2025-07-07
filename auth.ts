import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/prisma";
import Resend from "next-auth/providers/resend";
import {ENV_VARIABLES} from "@/env";

export const {handlers, auth, signIn, signOut} = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        Resend({
            // If your environment variable is named differently than default
            apiKey: ENV_VARIABLES.AUTH_RESEND_KEY,
            from: "no-reply@indexopia.com",
        }),
    ],
});
