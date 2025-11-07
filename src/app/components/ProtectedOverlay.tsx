import {EyeOff, Eye} from "lucide-react";

/**
 * Useful for hiding some content until credibility is reached — for example, sign-in or subscription.
 * @param onClick
 * @constructor
 */
// @ts-ignore
export const ProtectedOverlay = (onClick: () => void) => (
    <div
        className="absolute inset-0 bg-gray-300 rounded flex items-center justify-center cursor-pointer transition-colors z-10 group"
        onClick={onClick}
    >
        <EyeOff className="h-4 w-4 text-gray-500 group-hover:hidden" />
        <Eye className="h-4 w-4 text-gray-500 hidden group-hover:block" />
    </div>
);
