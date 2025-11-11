"use client";

import {useTransition} from "react";
import {useLocale} from "next-intl";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Loader2} from "lucide-react";
import {usePathname, useRouter} from "@/i18n/navigation";
import {useParams} from "next/navigation";

type SupportedLocale = "en" | "uk" | "ru";

const NATIVE_LABELS: Record<SupportedLocale, string> = {
    en: "English",
    uk: "Українська",
    ru: "Русский",
};

const FLAGS_CODES: Record<SupportedLocale, string> = {
    en: "US",
    uk: "UA",
    ru: "RU",
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
                            <CountryFlag code={FLAGS_CODES[locale]} />
                            {NATIVE_LABELS[locale]}
                        </>
                    ) : (
                        <>
                            <CountryFlag code={FLAGS_CODES[locale]} />
                            {NATIVE_LABELS[locale]}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {(Object.keys(NATIVE_LABELS) as SupportedLocale[]).map(loc => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => handleLanguageChange(loc)}
                        disabled={isLoadingTransition}
                    >
                        <CountryFlag code={FLAGS_CODES[loc]} />
                        {NATIVE_LABELS[loc]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Usage
 * <CountryFlag code="US" /> // 🇺🇸
 * <CountryFlag code="GB" /> // 🇬🇧
 */
const CountryFlag = ({code}: {code: string}) => {
    const codePoints = code
        .toUpperCase()
        .split("")
        .map(char => 127397 + char.charCodeAt(0));
    return <span>{String.fromCodePoint(...codePoints)}</span>;
};
