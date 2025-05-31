"use client";

import {Id} from "@/utils/types/general.types";

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
