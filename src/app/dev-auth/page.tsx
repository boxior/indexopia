import {devAuthCheck} from "@/app/actions/devAuth";
import {redirect} from "next/navigation";
import DevAuthDialog from "@/app/dev-auth/components/DevAuthDialog";
import {SuspenseContainer} from "@/components/SuspenseContainer";

export default async function DevAuthPage() {
    return (
        <SuspenseContainer>
            <SuspendedComponent />
        </SuspenseContainer>
    );
}

const SuspendedComponent = async () => {
    const isDevAuth = await devAuthCheck();

    if (isDevAuth) {
        redirect("/indexes");
    }

    return <DevAuthDialog />;
};
