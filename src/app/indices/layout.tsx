import type {Metadata} from "next";
import {auth} from "@/auth";
import {PATH_URLS} from "@/utils/constants/general.constants";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {redirect} from "next/navigation";
import Header from "@/app/components/Header/Header";

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
        <SuspenseContainer>
            <Header />
            <IndicesLayoutComponent children={children} />
        </SuspenseContainer>
    );
}

const IndicesLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    if (!session) {
        return redirect(PATH_URLS.signIn);
    }

    return children;
};
