"use client";

import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Globe} from "lucide-react";
import {supportedLanguages} from "@/lib/i18n/i18n";

export default function LanguageSelector() {
    const {i18n} = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const currentLanguage =
        supportedLanguages[i18n.language as keyof typeof supportedLanguages] ||
        supportedLanguages[i18n.language.split("-")[0] as keyof typeof supportedLanguages] ||
        supportedLanguages.en;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Select language"
            >
                <Globe className="h-4 w-4" />
                <span>{currentLanguage}</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                        {Object.entries(supportedLanguages).map(([code, name]) => (
                            <button
                                key={code}
                                onClick={() => changeLanguage(code)}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                    i18n.language === code || i18n.language.startsWith(code)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
