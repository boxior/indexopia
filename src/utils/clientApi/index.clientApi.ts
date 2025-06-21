"use client";

import {Id, IndexOverview, IndexOverviewAsset} from "@/utils/types/general.types";

export const clientApiCreateIndex = async ({
    name,
    assets,
}: {
    name: string;
    assets: IndexOverviewAsset[];
}): Promise<{indexOverview: IndexOverview}> => {
    try {
        const response = await fetch(`/api/indexes`, {
            method: "POST",
            body: JSON.stringify({name, assets}),
        });

        if (!response.ok) {
            throw new Error("Failed to delete custom index");
        }

        return response.json();
    } catch (error) {
        console.error("Error while deleting custom index:", error);
        throw error;
    }
};

export const clientApiDeleteIndex = async (indexId: Id) => {
    try {
        const response = await fetch(`/api/indexes/${indexId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete custom index");
        }
        console.log("Deleted custom index:", indexId);
    } catch (error) {
        console.error("Error while deleting custom index:", error);
        throw error;
    }
};

export const clientApiGetAssets = async () => {
    try {
        const response = await fetch(`/api/assets`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to get assets.");
        }

        return response.json();
    } catch (error) {
        console.error("Error while deleting custom index:", error);
        throw error;
    }
};

export const clientApiGetIndexHistory = async (id: Id, indexOverview?: IndexOverview) => {
    try {
        const response = await fetch(`/api/indexes/${id}/history`, {
            method: "POST",
            body: JSON.stringify({indexOverview}),
        });

        if (!response.ok) {
            throw new Error("Failed to get assets.");
        }

        return response.json();
    } catch (error) {
        console.error("Error while deleting custom index:", error);
        throw error;
    }
};
