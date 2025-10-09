"use client";

import {useState} from "react";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Loader2, Mail, ArrowLeft, CheckCircle} from "lucide-react";
import {PAGES_URLS} from "@/utils/constants/general.constants";
import {ENV_VARIABLES} from "@/env";
import {useReCaptcha} from "@/app/[locale]/auth/signin/useReCaptcha";

export default function SignInPage() {
    const t = useTranslations("signIn");
    const tCaptcha = useTranslations("captcha");
    const tFooter = useTranslations("footer.sections.about");

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState("");

    useReCaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Execute Google reCAPTCHA v3
            const token = await window.grecaptcha.execute(ENV_VARIABLES.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
                action: "signin",
            });
            // Verify it server-side
            const verify = await fetch("/api/re-captcha", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token}),
            });

            const verifyResult = await verify.json();
            if (!verify.ok || !verifyResult.success) {
                setError(tCaptcha("error"));
                setIsLoading(false);
                return;
            }

            // Proceed with sign-in if captcha passes
            const result = await signIn("resend", {redirect: false, email});

            if (result?.error) {
                setError(t("errors.sendEmailFailed"));
            } else {
                setIsEmailSent(true);
            }
        } catch (err) {
            setError(t("errors.unexpectedError"));
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (isEmailSent) {
        return (
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">{t("emailSent.title")}</CardTitle>
                        <CardDescription className="text-gray-600">
                            {t("emailSent.description")} <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">{t("emailSent.instructions")}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">{t("emailSent.troubleshooting.title")}</p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>• {t("emailSent.troubleshooting.checkSpam")}</li>
                                <li>• {t("emailSent.troubleshooting.checkEmail", {email})}</li>
                                <li>• {t("emailSent.troubleshooting.tryAgain")}</li>
                            </ul>
                        </div>

                        <Button
                            onClick={() => {
                                setIsEmailSent(false);
                                setEmail("");
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            {t("emailSent.tryDifferentEmail")}
                        </Button>

                        <div className="text-center">
                            <Link href={PAGES_URLS.home} className="text-sm text-blue-600 hover:text-blue-800">
                                {t("backToHome")}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Link */}
                <div className="mb-8">
                    <Link
                        href={PAGES_URLS.home}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("backToHome")}
                    </Link>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        {/* Logo */}
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">IX</span>
                            </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-gray-900">{t("title")}</CardTitle>
                        <CardDescription className="text-gray-600">{t("description")}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    {t("form.emailLabel")}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("form.emailPlaceholder")}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isLoading || !isValidEmail(email)}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("form.sending")}
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        {t("form.sendButton")}
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                {t("legal.agreement")}{" "}
                                <Link href={PAGES_URLS.terms} className="text-blue-600 hover:text-blue-800">
                                    {tFooter("termsOfService")}
                                </Link>{" "}
                                {t("legal.and")}{" "}
                                <Link href={PAGES_URLS.privacy} className="text-blue-600 hover:text-blue-800">
                                    {tFooter("privacyPolicy")}
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("benefits.title")}</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                {t("benefits.fullData")}
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                {t("benefits.createPortfolios")}
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                {t("benefits.personalizedInsights")}
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                {t("benefits.premiumIndices")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
