import type {Metadata} from "next";
import {auth} from "@/auth";
import {PATH_URLS} from "@/utils/constants/general.constants";
import {SuspenseContainer} from "@/components/SuspenseContainer";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
    title: "Indexes",
    description: "Crypto indexes",
};

export default async function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseContainer>
            <SignInLayoutComponent children={children} />
        </SuspenseContainer>
    );
}

const SignInLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    if (session) {
        return redirect(PATH_URLS.indexes);
    }

    return children;
};
