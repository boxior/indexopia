import {Link} from "@/i18n/navigation";
import * as React from "react";
import {FC} from "react";

type LinkRefererProps = {
    href: string;
    children: React.ReactNode;
    view: "primary" | "secondary";
    target?: "_blank" | "_self" | "_parent" | "_top" | string;
    className?: string;
};
export const LinkReferer: FC<LinkRefererProps> = ({view, href, children, target, className}) => {
    return (
        <Link
            className={`${
                view === "primary"
                    ? "group inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 font-semibold capitalize"
                    : "group inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold capitalize"
            } ${className ?? ""}`}
            href={href}
            target={target}
        >
            <span className="relative">
                {children}
                <span
                    className={
                        view === "primary"
                            ? "absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"
                            : "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 ease-out"
                    }
                ></span>
            </span>
            <svg
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
};
