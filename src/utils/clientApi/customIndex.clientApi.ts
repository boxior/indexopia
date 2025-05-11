"use client";

export const clientApiDeleteCustomIndex = async (customIndexId: string) => {
    try {
        const response = await fetch(`/api/custom-index/${customIndexId}`, {
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
