import {devAuthCheck} from "@/app/actions/devAuth";
import {redirect} from "next/navigation";
import DevAuthDialog from "@/app/dev-auth/components/DevAuthDialog";

export default async function DevAuthPage() {
    const isDevAuth = await devAuthCheck();

    if (isDevAuth) {
        redirect("/indexes");
    }

    return <DevAuthDialog />;
}
