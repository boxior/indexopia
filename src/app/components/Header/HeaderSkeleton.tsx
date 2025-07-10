import {Skeleton} from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Skeleton */}
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-6 w-24" />
                    </div>

                    {/* Desktop Navigation Skeleton */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-10" />
                    </nav>

                    {/* Right side - Language, Auth Skeleton */}
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-9 w-20" />

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
