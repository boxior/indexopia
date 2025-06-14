"use client";

import {Id, IndexOverview} from "@/utils/types/general.types";

export const clientApiDeleteCustomIndex = async (customIndexId: Id) => {
    try {
        const response = await fetch(`/api/index/${customIndexId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete custom index");
        }
        console.log("Deleted custom index:", customIndexId);
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
        const response = await fetch(`/api/index/${id}/history`, {
            method: "POST",
            body: JSON.stringify(indexOverview),
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
