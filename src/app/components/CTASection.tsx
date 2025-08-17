"use client";

import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Link} from "@/i18n/navigation";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function CTASection() {
    const t = useTranslations("cta");

    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">{t("title")}</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t("subtitle")}</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={PAGES_URLS.signIn}>
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                    {t("getStartedFree")}
                                </Button>
                            </Link>
                            <Link href={PAGES_URLS.indices}>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    {t("exploreIndices")}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
