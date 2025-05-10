import {FC, PropsWithChildren, Suspense} from "react";

export const SuspenseContainer: FC<PropsWithChildren> = ({children}) => (
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
);
