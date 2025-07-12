// components/cta-section.tsx
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import Link from "next/link";
import {PATH_URLS} from "@/utils/constants/general.constants";

export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Crypto Journey?</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Join thousands of investors who trust Indexopia for their crypto portfolio management. Start
                            with our free tier and upgrade as you grow.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={PATH_URLS.signIn}>
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link href={PATH_URLS.indices}>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Explore Indices
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
