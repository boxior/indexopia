import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Home, Search, AlertCircle} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {CONTACT_EMAIL, PAGES_URLS} from "@/utils/constants/general.constants";
import "./globals.css";

// This page renders when a route like `/unknown.txt` is requested.
// In this case, the layout at `app/[locale]/layout.tsx` receives
// an invalid value as the `[locale]` param and calls `notFound()`.
export default async function GlobalNotFound() {
    const t = await getTranslations("notFound");

    return (
        <html lang={"en"}>
            <body className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 antialiased">
                <div className="flex min-h-screen flex-col items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl text-red-600">404</CardTitle>
                            <CardDescription className="text-lg font-medium">{t("title")}</CardDescription>
                            <CardDescription>{t("description")}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <Link href={PAGES_URLS.home}>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                        <Home className="mr-2 h-4 w-4" />
                                        {t("actions.backToHome")}
                                    </Button>
                                </Link>

                                <Link href={PAGES_URLS.indices}>
                                    <Button variant="outline" className="w-full">
                                        <Search className="mr-2 h-4 w-4" />
                                        {t("actions.exploreIndices")}
                                    </Button>
                                </Link>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                <p>
                                    {t("help.text")}{" "}
                                    <Link
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        {t("help.contact")}
                                    </Link>
                                    .
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </body>
        </html>
    );
}
