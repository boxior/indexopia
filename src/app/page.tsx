import {SuspenseContainer} from "@/components/SuspenseContainer";
import {AppHeader} from "@/app/components/AppHeader/AppHeader";

export default async function HomePage() {
    try {
        ////
    } catch (err) {
        console.log(err);
    }

    return (
        <SuspenseContainer>
            <AppHeader />
            Home page
        </SuspenseContainer>
    );
}
