// components/ui/content-loader.tsx
import {Skeleton} from "@/components/ui/skeleton";

interface ContentLoaderProps {
    type?: "card" | "table" | "list" | "text" | "chart";
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
