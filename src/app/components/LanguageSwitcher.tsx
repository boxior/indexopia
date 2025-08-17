"use client";

import {useTransition} from "react";
import {useLocale} from "next-intl";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Globe, Loader2} from "lucide-react";
import {usePathname, useRouter} from "@/i18n/navigation";
import {useParams} from "next/navigation";

type SupportedLocale = "en" | "uk" | "ru";

const nativeLabels: Record<SupportedLocale, string> = {
    en: "English",
    uk: "Українська",
    ru: "Русский",
};

export default function LanguageSwitcher() {
    const locale = useLocale() as SupportedLocale;
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isLoadingTransition, startTransition] = useTransition();

    const handleLanguageChange = (nextLocale: SupportedLocale) => {
        if (nextLocale === locale || isLoadingTransition) return;
        startTransition(() => {
            router.replace(
                // @ts-expect-error -- Params are consistent with the current route.
                {pathname, params},
                {locale: nextLocale}
            );
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-busy={isLoadingTransition} disabled={isLoadingTransition}>
                    {isLoadingTransition ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {nativeLabels[locale]}
                        </>
                    ) : (
                        <>
                            <Globe className="h-4 w-4 mr-2" />
                            {nativeLabels[locale]}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {(Object.keys(nativeLabels) as SupportedLocale[]).map(loc => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => handleLanguageChange(loc)}
                        disabled={isLoadingTransition}
                    >
                        {nativeLabels[loc]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
