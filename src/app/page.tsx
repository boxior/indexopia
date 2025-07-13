import {SuspenseContainer} from "@/components/SuspenseContainer";
import HeroSection from "@/app/components/HeroSection";
import IndicesPreview from "@/app/components/IndicesPreview";
import BenefitsSection from "@/app/components/BenefitsSection";
import CTASection from "@/app/components/CTASection";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default async function HomePage() {
    return (
        <SuspenseContainer>
            <HomePageSuspended />
        </SuspenseContainer>
    );
}

const HomePageSuspended = async () => {
    return (
        <>
            <Header />
            <main>
                <HeroSection />
                <IndicesPreview />
                <BenefitsSection />
                <CTASection />
            </main>
            <Footer />
        </>
    );
};
