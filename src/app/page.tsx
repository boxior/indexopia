"use client";

import HeroSection from "@/app/components/HeroSection";
import BenefitsSection from "@/app/components/BenefitsSection";
import CTASection from "@/app/components/CTASection";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import Link from "next/link";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import initI18n from "@/lib/i18n/i18n";

export default function HomePage() {
    useEffect(() => {
        initI18n();
    }, []);

    return <HomePageSuspended />;
}

const HomePageSuspended = () => {
    const {t} = useTranslation();

    // Since we need to make this component async but useTranslation only works in client components,
    // we'll need to refactor the data fetching part
    return (
        <SuspenseWrapper loadingMessage={t("homepage.loadingMessage")} variant="spinner" showLogo={true}>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <HeroSection />
                    <HomeIndicesSection />
                    <BenefitsSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </SuspenseWrapper>
    );
};

// Separate component for indices section to handle async data
const HomeIndicesSection = () => {
    const {t} = useTranslation();

    // For now, we'll use a placeholder. In a real app, you'd want to use a state management solution
    // or create a separate server component for this data fetching
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* IndicesTable would go here with fetched data */}
                <div className="text-center mt-8">
                    <Link href={PAGES_URLS.indices}>
                        <Button size="lg" variant="outline">
                            {t("homepage.viewAllIndices")}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
