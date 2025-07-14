"use client";

import {useState} from "react";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Loader2, Mail, ArrowLeft, CheckCircle} from "lucide-react";

export default function SignInPage() {
    const [email, setEmail] = useState("serhii.lyzun@gmail.com");

    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("resend", {/*redirectTo: PAGES_URLS.indices*/ redirect: false, email});

            if (result?.error) {
                setError("Failed to send sign-in email. Please try again.");
            } else {
                setIsEmailSent(true);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (isEmailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
                        <CardDescription className="text-gray-600">
                            We've sent a sign-in link to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                Click the link in your email to sign in to your account. The link will expire in 24
                                hours.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Didn't receive the email?</p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>• Check your spam folder</li>
                                <li>• Make sure {email} is correct</li>
                                <li>• Try signing in again</li>
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
                            Try Different Email
                        </Button>

                        <div className="text-center">
                            <Link href="/public" className="text-sm text-blue-600 hover:text-blue-800">
                                Back to Home
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Link */}
                <div className="mb-8">
                    <Link
                        href="/public"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
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

                        <CardTitle className="text-2xl font-bold text-gray-900">Sign in to Indexopia</CardTitle>
                        <CardDescription className="text-gray-600">
                            Enter your email to receive a secure sign-in link
                        </CardDescription>
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
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                    disabled={isLoading}
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
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Sign-in Link
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Why Sign In?</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Access full profit data and analytics
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Create and track your own portfolios
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Get personalized investment insights
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                Access premium crypto indices
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
