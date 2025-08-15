import HeroSection from "@/app/components/HeroSection";
import BenefitsSection from "@/app/components/BenefitsSection";
import CTASection from "@/app/components/CTASection";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {dbGetIndicesOverview} from "@/lib/db/helpers/db.indexOverview.helpers";
import {IndicesTable} from "@/app/indices/components/CLAUD_WEB/IndicesTable";
import {EntityMode} from "@/utils/types/general.types";
import Link from "next/link";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {Button} from "@/components/ui/button";
import {filterTopPerformance} from "@/app/indices/helpers";
import {actionGetIndicesWithHistoryOverview} from "@/app/indices/actions";

export default async function HomePage() {
    return <HomePageSuspended />;
}

const HomePageSuspended = async () => {
    const systemIndicesOverview = await dbGetIndicesOverview();

    const topIndices = filterTopPerformance(systemIndicesOverview, 3);
    const indices = await actionGetIndicesWithHistoryOverview(topIndices);

    return (
        <SuspenseWrapper loadingMessage="Loading Indexopia..." variant="spinner" showLogo={true}>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <HeroSection />
                    <section className="py-20 bg-white">
                        <div className="container mx-auto px-4">
                            <IndicesTable indices={indices} mode={EntityMode.VIEW} />
                            <div className="text-center mt-8">
                                <Link href={PAGES_URLS.indices}>
                                    <Button size="lg" variant="outline">
                                        View All Indices
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                    <BenefitsSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </SuspenseWrapper>
    );
};
