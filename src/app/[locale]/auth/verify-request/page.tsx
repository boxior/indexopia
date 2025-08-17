import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Mail} from "lucide-react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function VerifyRequestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
                    <CardDescription className="text-gray-600">
                        A sign-in link has been sent to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            Click the link in your email to sign in to your account.
                        </p>
                    </div>

                    <Link href={PAGES_URLS.home}>
                        <Button variant="outline" className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
