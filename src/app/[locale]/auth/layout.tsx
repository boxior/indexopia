import type {Metadata} from "next";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import Footer from "@/app/components/Footer";
import BasicHeader from "@/app/components/BasicHeader";

export const metadata: Metadata = {
    title: "Indices",
    description: "Crypto indices",
};

export default async function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <AuthLayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const AuthLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className={"min-h-screen flex flex-col justify-between"}>
            <BasicHeader />
            <div className={"flex flex-1"}>{children}</div>
            <Footer />
        </div>
    );
};
