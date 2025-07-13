// components/ui/page-loader.tsx

import LoadingDots from "@/components/Suspense/LoadingDots";
import LoadingSpinner from "@/components/Suspense/LoadingSpinner";

interface PageLoaderProps {
    variant?: "spinner" | "dots" | "pulse";
    message?: string;
    showLogo?: boolean;
    fullScreen?: boolean;
    className?: string;
}

export default function PageLoader({
    variant = "spinner",
    message = "Loading...",
    showLogo = true,
    fullScreen = true,
    className,
}: PageLoaderProps) {
    const containerClasses = fullScreen
        ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center py-20";

    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return <LoadingDots />;
            case "pulse":
                return (
                    <div className="flex space-x-2">
                        <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse" />
                        <div
                            className="h-3 w-3 bg-purple-600 rounded-full animate-pulse"
                            style={{animationDelay: "0.2s"}}
                        />
                        <div
                            className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"
                            style={{animationDelay: "0.4s"}}
                        />
                    </div>
                );
            default:
                return <LoadingSpinner size="lg" />;
        }
    };

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="text-center space-y-4">
                {showLogo && (
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold">IX</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Indexopia</span>
                    </div>
                )}

                <div className="flex justify-center">{renderLoader()}</div>

                {message && <p className="text-gray-600 font-medium">{message}</p>}
            </div>
        </div>
    );
}
