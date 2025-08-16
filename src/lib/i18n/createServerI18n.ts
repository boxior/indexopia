import {createInstance} from "i18next";
import {initReactI18next} from "react-i18next/initReactI18next";
import {supportedLanguages, defaultLanguage, fallbackLanguage} from "./i18n";

// Server-side translation instance
export async function createServerI18n(language: string = defaultLanguage) {
    const i18nInstance = createInstance();

    await i18nInstance.use(initReactI18next).init({
        lng: language,
        fallbackLng: fallbackLanguage,
        supportedLngs: Object.keys(supportedLanguages),
        interpolation: {
            escapeValue: false,
        },
        resources: {
            // Import the same resources as client-side
            en: {
                translation: {
                    // ... same translations as in i18n.ts
                },
            },
            ru: {
                translation: {
                    // ... same translations as in i18n.ts
                },
            },
            uk: {
                translation: {
                    // ... same translations as in i18n.ts
                },
            },
        },
    });

    return i18nInstance;
}
