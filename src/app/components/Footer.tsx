import Link from "next/link";
import {Twitter, Github, Youtube} from "lucide-react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <Link href={PAGES_URLS.home} className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">IX</span>
                            </div>
                            <span className="text-xl font-bold">Indexopia</span>
                        </Link>
                        <p className="text-gray-400 text-sm">
                            Indexopia is a platform for creating and tracking crypto indices and crypto portfolios.
                        </p>
                    </div>

                    {/* About Section */}
                    <div>
                        <h3 className="font-semibold mb-4">About</h3>
                        <ul className="space-y-2 text-sm">
                            {/* TODO: https://cryptofunds.atlassian.net/browse/SCRUM-28; https://cryptofunds.atlassian.net/browse/SCRUM-29*/}
                            {/*<li>*/}
                            {/*    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        About Us*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*<li>*/}
                            {/*    <Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        Disclaimer*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            <li>
                                <Link
                                    href={PAGES_URLS.terms}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={PAGES_URLS.privacy}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={PAGES_URLS.contact}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Explore</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={PAGES_URLS.indices}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Free Crypto Indices
                                </Link>
                            </li>

                            {/*<li>*/}
                            {/*    <Link href="/premium" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        Premium Crypto Indices*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*<li>*/}
                            {/*    <Link href="/tracker" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        Crypto Portfolio Tracker*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*TODO: https://cryptofunds.atlassian.net/browse/SCRUM-31*/}
                            {/*<li>*/}
                            {/*    <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        FAQ*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                            {/*<li>*/}
                            {/*    <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">*/}
                            {/*        Blog*/}
                            {/*    </Link>*/}
                            {/*</li>*/}
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="font-semibold mb-4">Join Our Community</h3>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Youtube className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                    <p>© 2025 Indexopia. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
