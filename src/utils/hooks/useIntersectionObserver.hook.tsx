import {useEffect, useState, useRef} from "react";

export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: "50px",
                ...options,
            }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, []);

    return {targetRef, isIntersecting};
}
