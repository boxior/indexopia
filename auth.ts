import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/prisma";
import Resend from "next-auth/providers/resend";
import {ENV_VARIABLES} from "@/env";
import {Resend as ResendClass} from "resend";

const resend = new ResendClass(ENV_VARIABLES.AUTH_RESEND_KEY);

export const {handlers, auth} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Resend({
            // If your environment variable is named differently than default
            apiKey: ENV_VARIABLES.AUTH_RESEND_KEY,
            from: "no-reply@indexopia.com",
            async sendVerificationRequest({identifier: email, url}) {
                await resend.emails.send({
                    from: "Indexopia <noreply@indexopia.com>",
                    to: email,
                    subject: "Sign in to Indexopia",
                    html: `
                    <h2>Welcome to Indexopia!</h2>
                    <p>Click the link below to sign in:</p>
                    <a href="${url}" style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Sign in to Indexopia
                    </a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                  `,
                });
            },
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
    },
    callbacks: {
        async session({session, user}) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});
