"use client";

import {SuspenseContainer} from "@/components/SuspenseContainer";
import Header from "@/app/components/Header/Header";
import HeroSection from "@/app/components/HeroSection";
import IndicesPreview from "@/app/components/IndicesPreview";
import BenefitsSection from "@/app/components/BenefitsSection/BenefitsSection";
import CTASection from "@/app/components/CTASection";
import Footer from "@/app/components/Footer/Footer";

export function HomeClient() {
    return (
        <SuspenseContainer>
            <Header />
            <main>
                <HeroSection />
                <IndicesPreview />
                <BenefitsSection />
                <CTASection />
            </main>
            <Footer />
        </SuspenseContainer>
    );
}
