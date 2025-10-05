import {ReactNode, Suspense} from "react";
import Script from "next/script";
import Analytics from "@/app/Analytics";
import {ENV_VARIABLES} from "@/env";

type Props = {
    children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({children}: Props) {
    return (
        <Suspense>
            <Script
                strategy="afterInteractive"
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${ENV_VARIABLES.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ENV_VARIABLES.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
        `}</Script>
            <Analytics />
            {children}
        </Suspense>
    );
}
