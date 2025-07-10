import {Skeleton} from "@/components/ui/skeleton";

export default function FooterSkeleton() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description Skeleton */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
                            <Skeleton className="h-6 w-24 bg-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-gray-700" />
                            <Skeleton className="h-4 w-3/4 bg-gray-700" />
                        </div>
                    </div>

                    {/* About Section Skeleton */}
                    <div>
                        <Skeleton className="h-6 w-16 mb-4 bg-gray-700" />
                        <ul className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <li key={i}>
                                    <Skeleton className="h-4 w-20 bg-gray-700" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Explore Section Skeleton */}
                    <div>
                        <Skeleton className="h-6 w-16 mb-4 bg-gray-700" />
                        <ul className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <li key={i}>
                                    <Skeleton className="h-4 w-24 bg-gray-700" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Media Skeleton */}
                    <div>
                        <Skeleton className="h-6 w-32 mb-4 bg-gray-700" />
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-5 w-5 bg-gray-700" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <Skeleton className="h-4 w-48 mx-auto bg-gray-700" />
                </div>
            </div>
        </footer>
    );
}
