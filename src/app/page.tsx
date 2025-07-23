import HeroSection from "@/app/components/HeroSection";
import IndicesPreview from "@/app/components/IndicesPreview";
import BenefitsSection from "@/app/components/BenefitsSection";
import CTASection from "@/app/components/CTASection";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";

export default async function HomePage() {
    return <HomePageSuspended />;
}

const HomePageSuspended = async () => {
    return (
        <SuspenseWrapper loadingMessage="Loading Indexopia..." variant="spinner" showLogo={true}>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <HeroSection />
                    <IndicesPreview />
                    <BenefitsSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </SuspenseWrapper>
    );
};
