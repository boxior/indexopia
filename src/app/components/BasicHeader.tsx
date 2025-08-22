"use client";

import {useTranslations} from "next-intl";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {Link} from "@/i18n/navigation";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function BasicHeader() {
    const t = useTranslations("header");

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

                    {/* Right side - Language, Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}
