import type {Metadata} from "next";
import {auth} from "@/auth";
import {PATH_URLS} from "@/utils/constants/general.constants";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {redirect} from "next/navigation";
import {AppHeader} from "@/app/components/AppHeader/AppHeader";

export const metadata: Metadata = {
    title: "Indexes",
    description: "Crypto indexes",
};

export default async function IndexesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseContainer>
            <AppHeader />
            <IndexesLayoutComponent children={children} />
        </SuspenseContainer>
    );
}

const IndexesLayoutComponent = async ({
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
