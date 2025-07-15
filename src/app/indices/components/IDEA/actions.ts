"use server";

import {auth} from "@/auth";
import {redirect} from "next/navigation";

export async function getIndices() {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Mock data - replace with actual database queries
    return [
        {
            id: "1",
            name: "Tech Growth Index",
            description: "Focus on high-growth technology companies",
            performance: 12.5,
            status: "active" as const,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20"),
            stockCount: 25,
            category: "technology",
        },
        {
            id: "2",
            name: "Healthcare Innovation",
            description: "Biotech and healthcare innovation stocks",
            performance: -2.3,
            status: "active" as const,
            createdAt: new Date("2024-02-01"),
            updatedAt: new Date("2024-02-05"),
            stockCount: 18,
            category: "healthcare",
        },
        {
            id: "3",
            name: "Sustainable Energy",
            description: "Clean energy and sustainable technology",
            performance: 8.7,
            status: "draft" as const,
            createdAt: new Date("2024-02-10"),
            updatedAt: new Date("2024-02-10"),
            stockCount: 12,
            category: "energy",
        },
    ];
}

export async function createIndex(data: any) {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Mock implementation - replace with actual database creation
    console.log("Creating index:", data);

    return {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        stockCount: data.stocks?.length || 0,
        performance: 0,
    };
}

export async function updateIndex(id: string, data: any) {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Mock implementation - replace with actual database update
    console.log("Updating index:", id, data);

    return {
        id,
        ...data,
        updatedAt: new Date(),
        stockCount: data.stocks?.length || 0,
    };
}

export async function cloneIndex(id: string) {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Mock implementation - replace with actual database cloning
    console.log("Cloning index:", id);

    return {
        id: Date.now().toString(),
        name: "Copy of Tech Growth Index",
        description: "Focus on high-growth technology companies",
        performance: 0,
        status: "draft" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        stockCount: 25,
        category: "technology",
    };
}

export async function deleteIndex(id: string) {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Mock implementation - replace with actual database deletion
    console.log("Deleting index:", id);

    return {success: true};
}
