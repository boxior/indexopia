"use client";

import {useSearchParams} from "next/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle, Home, RefreshCw} from "lucide-react";
import Link from "next/link";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorDetails = (error: string | null) => {
        switch (error) {
            case "Verification":
                return {
                    title: "Link Expired",
                    description: "The sign-in link has expired or has already been used.",
                    suggestion: "Please request a new sign-in link.",
                };
            case "Configuration":
                return {
                    title: "Server Error",
                    description: "There is a problem with the server configuration.",
                    suggestion: "Please contact support if this problem persists.",
                };
            case "AccessDenied":
                return {
                    title: "Access Denied",
                    description: "You do not have permission to access this resource.",
                    suggestion: "Please check your email and try again.",
                };
            case "EmailSignin":
                return {
                    title: "Email Error",
                    description: "The email could not be sent.",
                    suggestion: "Please check your email address and try again.",
                };
            default:
                return {
                    title: "Authentication Error",
                    description: "An unexpected error occurred during sign-in.",
                    suggestion: "Please try again or contact support if the problem persists.",
                };
        }
    };

    const errorDetails = getErrorDetails(error);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
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
                        <Link href={PAGES_URLS.signIn}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try signing in again
                            </Button>
                        </Link>
                        <Link href={PAGES_URLS.home}>
                            <Button variant="outline" className="w-full">
                                <Home className="mr-2 h-4 w-4" />
                                Back to homepage
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>
                            Need help?{" "}
                            <Link href={PAGES_URLS.contact} className="text-blue-600 hover:text-blue-700">
                                Contact support
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
