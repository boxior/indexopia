import React from "react";
import {auth} from "@/auth";
import {AppHeaderClient} from "@/app/components/AppHeader/AppHeaderClient";
import {SuspenseContainer} from "@/components/SuspenseContainer";

export const AppHeader = async () => {
    const session = await auth();

    return (
        <SuspenseContainer>
            <AppHeaderClient session={session} />
        </SuspenseContainer>
    );
};
