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
import {useTranslation} from "react-i18next";
import {supportedLanguages} from "@/lib/i18n/i18n";

export default function Header() {
    const {data, status, update} = useSession();
    const {user} = data ?? {};
    const {t, i18n} = useTranslation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({redirectTo: PAGES_URLS.home});
        await update();
    };

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    // Get current language display name
    const getCurrentLanguageName = () => {
        const currentLang = i18n.language;
        return (
            supportedLanguages[currentLang as keyof typeof supportedLanguages] ||
            supportedLanguages[currentLang.split("-")[0] as keyof typeof supportedLanguages] ||
            supportedLanguages.en
        );
    };

    // Get current language code for display (uppercase)
    const getCurrentLanguageCode = () => {
        const currentLang = i18n.language;
        if (currentLang.startsWith("en")) return "EN";
        if (currentLang.startsWith("ru")) return "RU";
        if (currentLang.startsWith("uk")) return "UK";
        return "EN";
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
                            {t("home")}
                        </Link>
                        <Link href={PAGES_URLS.indices} className="text-gray-700 hover:text-blue-600 transition-colors">
                            {t("indices")}
                        </Link>
                        {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                        {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    {t('about')}*/}
                        {/*</Link>*/}
                        {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">*/}
                        {/*    {t('blog')}*/}
                        {/*</Link>*/}
                    </nav>

                    {/* Right side - Language, Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
                                    <span className="sm:hidden">{getCurrentLanguageCode()}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.entries(supportedLanguages).map(([code, name]) => (
                                    <DropdownMenuItem
                                        key={code}
                                        onClick={() => handleLanguageChange(code)}
                                        className={`cursor-pointer ${
                                            i18n.language === code || i18n.language.startsWith(code)
                                                ? "bg-blue-50 text-blue-700"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{name}</span>
                                            <span className="text-xs text-gray-500 ml-2">{code.toUpperCase()}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
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
                                        <p className="text-sm font-medium">{user.name || t("auth.user")}</p>
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
                            aria-label={isMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
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
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("home")}
                            </Link>
                            <Link
                                href={PAGES_URLS.indices}
                                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("indices")}
                            </Link>
                            {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                            {/*<Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    {t('about')}*/}
                            {/*</Link>*/}
                            {/*<Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors p-2">*/}
                            {/*    {t('blog')}*/}
                            {/*</Link>*/}
                        </nav>

                        {/* Mobile Language Selector */}
                        <div className="border-t pt-4 mt-4">
                            <div className="px-2 mb-2">
                                <span className="text-sm font-medium text-gray-700">{t("common.language")}</span>
                            </div>
                            <div className="space-y-1">
                                {Object.entries(supportedLanguages).map(([code, name]) => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            handleLanguageChange(code);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full text-left p-2 rounded transition-colors ${
                                            i18n.language === code || i18n.language.startsWith(code)
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{name}</span>
                                            <span className="text-xs text-gray-500">{code.toUpperCase()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
