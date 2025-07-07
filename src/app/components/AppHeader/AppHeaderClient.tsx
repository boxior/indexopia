"use client";

import React, {useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button";
import {Session} from "next-auth";
import {authSignOut} from "@/app/components/AppHeader/actions";

export const AppHeaderClient = ({session}: {session: Session | null}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Perform logout logic here
            await authSignOut(); // Replace with proper logic if required
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return null;
    }

    return (
        <header className="flex items-center justify-between px-4 py-2 border-b">
            <h1 className="text-xl font-semibold">App Name</h1>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <Avatar onClick={() => setIsDropdownOpen(prev => !prev)} className="cursor-pointer">
                        <AvatarImage src="/path-to-avatar.jpg" alt="User Avatar" className="h-10 w-10 rounded-full" />
                        <AvatarFallback className="bg-gray-100 text-gray-600">User Name</AvatarFallback>
                    </Avatar>
                    {/* Dropdown inside avatar */}
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-md rounded-md border p-2">
                            <Button onClick={handleLogout} disabled={isLoading} className="w-full text-sm">
                                {isLoading ? "Logging out..." : "Logout"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
