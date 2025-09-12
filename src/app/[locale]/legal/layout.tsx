import type {Metadata} from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {TooltipProvider} from "@/components/ui/tooltip";

export const metadata: Metadata = {
    title: "Legal",
    description: "Terms and Privacy",
};

export default async function IndicesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <LayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const LayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="min-h-screen flex flex-col">
            <TooltipProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </TooltipProvider>
        </div>
    );
};
