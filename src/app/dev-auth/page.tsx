import {devAuthCheck} from "@/app/actions/devAuth";
import {redirect} from "next/navigation";
import DevAuthDialog from "@/app/dev-auth/components/DevAuthDialog";
import SuspenseWrapper from "@/components/Suspense/SuspenseWrapper";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default async function DevAuthPage() {
    return (
        <SuspenseWrapper>
            <SuspendedComponent />
        </SuspenseWrapper>
    );
}

const SuspendedComponent = async () => {
    const isDevAuth = await devAuthCheck();

    if (isDevAuth) {
        redirect(PAGES_URLS.indices);
    }

    return <DevAuthDialog />;
};
