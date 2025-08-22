import {defineRouting} from "next-intl/routing";
import {DEFAULT_LOCALE, SUPPORTED_LOCALES} from "@/utils/constants/general.constants";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: SUPPORTED_LOCALES,

    // Used when no locale matches
    defaultLocale: DEFAULT_LOCALE,
});
