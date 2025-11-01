import {Suspense} from "react";
import PageLoader from "@/components/Suspense/PageLoader";
import {useTranslations} from "next-intl";

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
    loadingMessage,
    variant = "spinner",
    showLogo = true,
    fullScreen = true,
}: SuspenseWrapperProps) {
    const t = useTranslations("common");

    const defaultFallback = (
        <PageLoader
            variant={variant}
            message={loadingMessage ?? t("loading")}
            showLogo={showLogo}
            fullScreen={fullScreen}
        />
    );

    return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}
