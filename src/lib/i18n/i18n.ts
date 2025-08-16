import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import resourcesToBackend from "i18next-resources-to-backend";

// Define supported languages
export const supportedLanguages = {
    en: "English",
    ru: "Русский",
    uk: "Українська",
};

export const defaultLanguage = "en";
export const fallbackLanguage = "en";

// Language detection options
const detectionOptions = {
    // Order of language detection methods
    order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],

    // Cache the detected language
    caches: ["localStorage"],

    // Don't cache in cookies for GDPR compliance
    excludeCacheFor: ["cimode"],

    // Check all fallback languages
    checkWhitelist: true,

    // localStorage specific options
    lookupLocalStorage: "i18nextLng",

    // Convert language codes (optional - helps with consistency)
    convertDetectedLanguage: (lng: string) => {
        // If detected language is not in supported languages, use fallback
        if (lng && supportedLanguages[lng as keyof typeof supportedLanguages]) {
            return lng;
        }

        // Handle language codes with regions (e.g., 'en-US' -> 'en')
        const shortCode = lng?.split("-")[0];
        if (shortCode && supportedLanguages[shortCode as keyof typeof supportedLanguages]) {
            return shortCode;
        }

        return fallbackLanguage;
    },
};

// Initialize i18next
const initI18n = () => {
    if (!i18n.isInitialized) {
        i18n.use(ChainedBackend)
            .use(LanguageDetector)
            .use(initReactI18next)
            .init({
                // Supported languages
                supportedLngs: Object.keys(supportedLanguages),

                // Fallback language
                fallbackLng: fallbackLanguage,

                // Default language - remove this to let detection work properly
                // lng: defaultLanguage,

                // Language detection
                detection: detectionOptions,

                // Debug mode (set to false in production)
                debug: process.env.NODE_ENV === "development",

                // Backend configuration
                backend: {
                    backends: [
                        HttpBackend, // Primary backend for loading from JSON files
                        resourcesToBackend((language: string, namespace: string) => {
                            // Fallback backend with empty object if file not found
                            return {};
                        }),
                    ],
                    backendOptions: [
                        {
                            // HttpBackend options
                            loadPath: "/locales/{{lng}}/{{ns}}.json",
                            requestOptions: {
                                cache: "default",
                            },
                        },
                        {}, // resourcesToBackend options (empty)
                    ],
                },

                // Interpolation options
                interpolation: {
                    escapeValue: false, // React already escapes values
                },

                // React options
                react: {
                    useSuspense: false, // We'll handle loading states manually
                },
            });
    }

    return i18n;
};

export default initI18n;
