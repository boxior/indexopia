"use client";

import Link from "next/link";
import {Twitter, Github, Youtube} from "lucide-react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {useTranslation} from "react-i18next";

export default function Footer() {
    const {t} = useTranslation();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <Link href={PAGES_URLS.home} className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">IX</span>
                            </div>
                            <span className="text-xl font-bold">Indexopia</span>
                        </Link>
                        <p className="text-gray-400 text-sm">{t("footer.description")}</p>
                    </div>

                    {/* About Section */}
                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.about")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={PAGES_URLS.terms}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {t("footer.termsOfService")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={PAGES_URLS.privacy}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {t("footer.privacyPolicy")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={PAGES_URLS.contact}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {t("footer.contact")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore Section */}
                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.explore")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={PAGES_URLS.indices}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {t("footer.freeIndices")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media and Language Selector */}
                    <div>
                        <h3 className="font-semibold mb-4">{t("footer.community")}</h3>
                        <div className="flex space-x-4 mb-4">
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                    <p>{t("footer.copyright")}</p>
                </div>
            </div>
        </footer>
    );
}
