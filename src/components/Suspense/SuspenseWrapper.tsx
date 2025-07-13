// components/ui/suspense-wrapper.tsx
import {Suspense} from "react";
import PageLoader from "@/components/Suspense/PageLoader";

interface SuspenseWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loadingMessage?: string;
    variant?: "spinner" | "dots" | "pulse";
    showLogo?: boolean;
    fullScreen?: boolean;
}

export default function SuspenseWrapper({
    children,
    fallback,
    loadingMessage = "Loading...",
    variant = "spinner",
    showLogo = true,
    fullScreen = true,
}: SuspenseWrapperProps) {
    const defaultFallback = (
        <PageLoader variant={variant} message={loadingMessage} showLogo={showLogo} fullScreen={fullScreen} />
    );

    return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}
