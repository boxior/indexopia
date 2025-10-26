/**
 * To populate database
 */

import {PrismaClient, Prisma} from "@prisma/client";

import {withAccelerate} from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Alice",
        email: "alice@prisma.io",
    },
    {
        name: "Bob",
        email: "bob@prisma.io",
    },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.create({data: u});
    }
}

main();
