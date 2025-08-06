import {Skeleton} from "@/components/ui/skeleton";

interface ContentLoaderProps {
    type?: "card" | "table" | "list" | "text" | "chart" | "chartPreview";
    count?: number;
    className?: string;
}

export default function ContentLoader({type = "card", count = 3, className}: ContentLoaderProps) {
    const renderSkeleton = () => {
        switch (type) {
            case "table":
                return (
                    <div className="space-y-4">
                        {/* Table header */}
                        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                            {Array.from({length: 6}).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                        {/* Table rows */}
                        {Array.from({length: count}).map((_, i) => (
                            <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b">
                                {Array.from({length: 6}).map((_, j) => (
                                    <Skeleton key={j} className="h-4 w-full" />
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case "list":
                return (
                    <div className="space-y-4">
                        {Array.from({length: count}).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>
                        ))}
                    </div>
                );

            case "text":
                return (
                    <div className="space-y-4">
                        {Array.from({length: count}).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </div>
                );

            case "chart":
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="text-center space-y-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-4 w-3/4 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "chartPreview":
                return (
                    <div className="space-y-2">
                        {/* Responsive chart preview skeleton */}
                        <div className="relative">
                            {/* Desktop version - compact for table cells */}
                            <div className="hidden lg:block">
                                <Skeleton className="h-16 w-32 rounded" />
                                {/* Simulate mini chart lines for desktop */}
                                <div className="absolute inset-2 flex items-end justify-between">
                                    <Skeleton className="h-2 w-1 rounded-full" />
                                    <Skeleton className="h-4 w-1 rounded-full" />
                                    <Skeleton className="h-3 w-1 rounded-full" />
                                    <Skeleton className="h-6 w-1 rounded-full" />
                                    <Skeleton className="h-2 w-1 rounded-full" />
                                    <Skeleton className="h-5 w-1 rounded-full" />
                                    <Skeleton className="h-4 w-1 rounded-full" />
                                </div>
                            </div>

                            {/* Mobile version - larger for expanded mobile cards */}
                            <div className="lg:hidden">
                                <Skeleton className="h-32 w-full rounded-lg" />
                                {/* Simulate chart area with grid lines */}
                                <div className="absolute inset-4 space-y-2">
                                    {/* Horizontal grid lines */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-0.5 w-full opacity-20" />
                                        <Skeleton className="h-0.5 w-full opacity-20" />
                                        <Skeleton className="h-0.5 w-full opacity-20" />
                                    </div>
                                    {/* Chart line simulation */}
                                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-2">
                                        {Array.from({length: 12}).map((_, i) => (
                                            <Skeleton
                                                key={i}
                                                className={`w-1 rounded-full ${
                                                    i % 3 === 0 ? "h-8" : i % 2 === 0 ? "h-6" : "h-4"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default: // card
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({length: count}).map((_, i) => (
                            <div key={i} className="border rounded-lg p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-20 w-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return <div className={`animate-pulse ${className}`}>{renderSkeleton()}</div>;
}
