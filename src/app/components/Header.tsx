"use client";

import {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {LogOut, Globe, Menu, X} from "lucide-react";
import {useSession} from "next-auth/react";
import {signOut} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function Header() {
    const {data, status, update} = useSession();
    const {user} = data ?? {};

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({redirectTo: PAGES_URLS.home});
        await update();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={PAGES_URLS.home} className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">IX</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">Indexopia</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href={PAGES_URLS.home} className="text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link href={PAGES_URLS.indices} className="text-gray-700 hover:text-blue-600 transition-colors">
                            Indices
                        </Link>
                        {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                        {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    About*/}
                        {/*</Link>*/}
                        {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    Blog*/}
                        {/*</Link>*/}
                    </nav>

                    {/* Right side - Language, Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Globe className="h-4 w-4 mr-2" />
                                    EN
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>English</DropdownMenuItem>
                                <DropdownMenuItem>Ukrainian</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Authentication */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-sm">
                                                {user?.email?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium">{user.name || "User"}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <DropdownMenuItem onClick={handleSignOut} disabled={status === "loading"}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href={PAGES_URLS.signIn}>
                                <Button>Sign In</Button>
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t py-4">
                        <nav className="flex flex-col space-y-2">
                            <Link
                                href={PAGES_URLS.home}
                                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                            >
                                Home
                            </Link>
                            <Link
                                href={PAGES_URLS.indices}
                                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                            >
                                Indices
                            </Link>
                            {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                            {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    About*/}
                            {/*</Link>*/}
                            {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    Blog*/}
                            {/*</Link>*/}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
