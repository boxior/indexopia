import {auth} from "@/auth";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {redirect} from "next/navigation";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";

export default async function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SuspenseWrapper>
            <SignInLayoutComponent children={children} />
        </SuspenseWrapper>
    );
}

const SignInLayoutComponent = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    if (session?.user) {
        return redirect(PAGES_URLS.indices);
    }

    return children;
};
