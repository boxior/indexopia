"use client";

import {Card, CardContent} from "@/components/ui/card";
import {BarChart3, Shield, Globe, Users, Zap, TrendingUp} from "lucide-react";
import {useTranslation} from "react-i18next";

export default function BenefitsSection() {
    const {t} = useTranslation();

    const benefits = [
        {
            icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
            title: t("homepage.benefits.professionalAnalytics"),
            description: t("homepage.benefits.professionalAnalyticsDesc"),
        },
        {
            icon: <Shield className="h-8 w-8 text-green-600" />,
            title: t("homepage.benefits.riskManagement"),
            description: t("homepage.benefits.riskManagementDesc"),
        },
        {
            icon: <Globe className="h-8 w-8 text-purple-600" />,
            title: t("homepage.benefits.globalMarkets"),
            description: t("homepage.benefits.globalMarketsDesc"),
        },
        {
            icon: <Users className="h-8 w-8 text-orange-600" />,
            title: t("homepage.benefits.communityDriven"),
            description: t("homepage.benefits.communityDrivenDesc"),
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-600" />,
            title: t("homepage.benefits.fastExecution"),
            description: t("homepage.benefits.fastExecutionDesc"),
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-red-600" />,
            title: t("homepage.benefits.provenStrategies"),
            description: t("homepage.benefits.provenStrategiesDesc"),
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("homepage.benefits.title")}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{t("homepage.benefits.subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">{benefit.icon}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-gray-600">{benefit.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
