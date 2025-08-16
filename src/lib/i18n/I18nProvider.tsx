"use client";

import {ReactNode, useEffect, useState} from "react";
import {I18nextProvider} from "react-i18next";
import initI18n from "./i18n";

interface I18nProviderProps {
    children: ReactNode;
}

export default function I18nProvider({children}: I18nProviderProps) {
    const [i18nInstance, setI18nInstance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeI18n = async () => {
            try {
                const i18n = initI18n();

                // Wait for i18n to be ready
                await new Promise(resolve => {
                    if (i18n.isInitialized) {
                        resolve(true);
                    } else {
                        i18n.on("initialized", () => {
                            resolve(true);
                        });
                    }
                });

                setI18nInstance(i18n);
            } catch (error) {
                console.error("Failed to initialize i18n:", error);
                // Still set the instance to prevent infinite loading
                const i18n = initI18n();
                setI18nInstance(i18n);
            } finally {
                setIsLoading(false);
            }
        };

        void initializeI18n();
    }, []);

    if (isLoading || !i18nInstance) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
