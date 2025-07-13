// components/ui/loading-overlay.tsx
import LoadingSpinner from "@/components/Suspense/LoadingSpinner";

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    children: React.ReactNode;
}

export default function LoadingOverlay({isLoading, message = "Loading...", children}: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="text-center space-y-3">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600 font-medium">{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
