"use client";

import {useSearchParams} from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle, Home, RefreshCw} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {CONTACT_EMAIL, PAGES_URLS} from "@/utils/constants/general.constants";

export default function ErrorPage() {
    const t = useTranslations("error");
    const tFooter = useTranslations("footer.sections.about");
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorDetails = (error: string | null) => {
        switch (error) {
            case "Verification":
                return {
                    title: t("types.verification.title"),
                    description: t("types.verification.description"),
                    suggestion: t("types.verification.suggestion"),
                };
            case "Configuration":
                return {
                    title: t("types.configuration.title"),
                    description: t("types.configuration.description"),
                    suggestion: t("types.configuration.suggestion"),
                };
            case "AccessDenied":
                return {
                    title: t("types.accessDenied.title"),
                    description: t("types.accessDenied.description"),
                    suggestion: t("types.accessDenied.suggestion"),
                };
            case "EmailSignin":
                return {
                    title: t("types.emailSignin.title"),
                    description: t("types.emailSignin.description"),
                    suggestion: t("types.emailSignin.suggestion"),
                };
            default:
                return {
                    title: t("types.default.title"),
                    description: t("types.default.description"),
                    suggestion: t("types.default.suggestion"),
                };
        }
    };

    const errorDetails = getErrorDetails(error);

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-600">{errorDetails.title}</CardTitle>
                    <CardDescription>{errorDetails.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertDescription className="text-amber-800">{errorDetails.suggestion}</AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-3">
                        <Link href={PAGES_URLS.authSignIn}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t("actions.tryAgain")}
                            </Button>
                        </Link>
                        <Link href={PAGES_URLS.home}>
                            <Button variant="outline" className="w-full">
                                <Home className="mr-2 h-4 w-4" />
                                {t("actions.backToHomepage")}
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>
                            {t("support.needHelp")}{" "}
                            <Link href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-700">
                                {tFooter("contact")}
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
