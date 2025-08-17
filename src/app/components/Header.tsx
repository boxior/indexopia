"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {LogOut, Menu, X} from "lucide-react";
import {useSession} from "next-auth/react";
import {signOut} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {Link} from "@/i18n/navigation";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Header() {
    const t = useTranslations("header");
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
                        <span className="text-xl font-bold text-gray-900">{t("brand")}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href={PAGES_URLS.home} className="text-gray-700 hover:text-blue-600 transition-colors">
                            {t("navigation.home")}
                        </Link>
                        <Link href={PAGES_URLS.indices} className="text-gray-700 hover:text-blue-600 transition-colors">
                            {t("navigation.indices")}
                        </Link>
                        {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                        {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    {t("navigation.about")}*/}
                        {/*</Link>*/}
                        {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    {t("navigation.blog")}*/}
                        {/*</Link>*/}
                    </nav>

                    {/* Right side - Language, Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <LanguageSwitcher />

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
                                    <DropdownMenuItem
                                        className={"hover:cursor-pointer"}
                                        onClick={handleSignOut}
                                        disabled={status === "loading"}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {t("auth.signOut")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href={PAGES_URLS.signIn}>
                                <Button>{t("auth.signIn")}</Button>
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
                                {t("navigation.home")}
                            </Link>
                            <Link
                                href={PAGES_URLS.indices}
                                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                            >
                                {t("navigation.indices")}
                            </Link>
                            {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                            {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    {t("navigation.about")}*/}
                            {/*</Link>*/}
                            {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    {t("navigation.blog")}*/}
                            {/*</Link>*/}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
