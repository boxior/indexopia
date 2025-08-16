"use client";

import {useTranslation as useReactI18nextTranslation} from "react-i18next";

// Re-export useTranslation hook for consistency
export const useTranslation = useReactI18nextTranslation;

// Custom hook for typed translations
export function useTypedTranslation() {
    const {t, i18n} = useReactI18nextTranslation();

    return {
        t,
        i18n,
        language: i18n.language,
        changeLanguage: i18n.changeLanguage,
        isRTL: i18n.dir() === "rtl",
    };
}
