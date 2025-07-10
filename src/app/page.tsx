import {SuspenseContainer} from "@/components/SuspenseContainer";
import {HomeClient} from "@/app/pageClient";

export default async function HomeServer() {
    return (
        <SuspenseContainer>
            <HomeServerSuspended />
        </SuspenseContainer>
    );
}

const HomeServerSuspended = async () => {
    return <HomeClient />;
};
