"use client";

import {useEffect} from "react";
import {ENV_VARIABLES} from "@/env";
import {useLocale} from "next-intl";

export const useReCaptcha = () => {
    const locale = useLocale();

    useEffect(() => {
        // Create and append the script manually
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${ENV_VARIABLES.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}&hl=${locale}`;
        script.async = true;
        script.defer = true;
        script.id = "recaptcha-script";
        document.body.appendChild(script);

        return () => {
            // ✅ Remove script on unmount
            const existingScript = document.getElementById("recaptcha-script");
            if (existingScript) existingScript.remove();

            // ✅ Clean up the injected reCAPTCHA elements
            const recaptchaBadges = document.querySelectorAll(".grecaptcha-badge");
            recaptchaBadges.forEach(badge => badge.remove());
        };
    }, [locale]);
};
