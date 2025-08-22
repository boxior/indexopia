import type {Metadata} from "next";
import {auth} from "@/auth";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {redirect} from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {TooltipProvider} from "@/components/ui/tooltip";

export const metadata: Metadata = {
    title: "Indices",
    description: "Crypto indices",
};

export default async function IndicesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <IndicesLayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const IndicesLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    if (!session) {
        return redirect(PAGES_URLS.authSignIn);
    }

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
