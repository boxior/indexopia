"use client";

import React, {useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/components/ui/button";
import {Session} from "next-auth";
import {authSignOut} from "@/app/components/AppHeader/actions";
import {redirect, useRouter} from "next/navigation";
import {PATH_URLS} from "@/utils/constants/general.constants";

export const AppHeaderClient = ({session}: {session: Session | null}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

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

    const handleSignIn = () => {
        redirect(PATH_URLS.signIn);
    };

    const handleHomeRedirect = () => {
        router.push("/");
    };

    return (
        <header className="flex items-center justify-between px-4 py-2 border-b">
            <h1 className="text-xl font-semibold cursor-pointer" onClick={handleHomeRedirect}>
                App Name
            </h1>

            <div className="flex items-center gap-4">
                {session ? (
                    // Avatar with Logout Dropdown
                    <div className="relative">
                        <Avatar onClick={() => setIsDropdownOpen(prev => !prev)} className="cursor-pointer">
                            <AvatarImage
                                src={session.user?.image || "/default-avatar.jpg"} // Replace with session avatar or a fallback
                                alt={session.user?.name || "User Avatar"}
                                className="h-10 w-10 rounded-full"
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                                {session.user?.name?.charAt(0).toUpperCase() || "Avatar"}
                            </AvatarFallback>
                        </Avatar>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-md rounded-md border p-2 z-10">
                                <Button onClick={handleLogout} disabled={isLoading} className="w-full text-sm">
                                    {isLoading ? "Logging out..." : "Logout"}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Sign-In Button
                    <Button onClick={handleSignIn} className="text-sm">
                        Sign in
                    </Button>
                )}
            </div>
        </header>
    );
};
