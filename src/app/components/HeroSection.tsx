"use client";

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {TrendingUp, Shield, Zap} from "lucide-react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {useTranslation} from "react-i18next";

export default function HeroSection() {
    const {t} = useTranslation();

    return (
        <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">{t("homepage.hero.title")}</h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("homepage.hero.subtitle")}</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link href={PAGES_URLS.indices}>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {t("homepage.hero.exploreIndices")}
                            </Button>
                        </Link>
                        <Link href={PAGES_URLS.signIn}>
                            <Button size="lg" variant="outline">
                                {t("homepage.hero.signUpFree")}
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("homepage.hero.realTimeData")}
                            </h3>
                            <p className="text-gray-600">{t("homepage.hero.realTimeDataDesc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("homepage.hero.professionalTools")}
                            </h3>
                            <p className="text-gray-600">{t("homepage.hero.professionalToolsDesc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                                <Zap className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("homepage.hero.thousandsPortfolios")}
                            </h3>
                            <p className="text-gray-600">{t("homepage.hero.thousandsPortfoliosDesc")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
