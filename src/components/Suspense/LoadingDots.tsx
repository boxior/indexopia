// components/ui/loading-dots.tsx
import {cn} from "@/lib/utils";

interface LoadingDotsProps {
    className?: string;
}

export default function LoadingDots({className}: LoadingDotsProps) {
    return (
        <div className={cn("flex space-x-1", className)}>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
        </div>
    );
}
