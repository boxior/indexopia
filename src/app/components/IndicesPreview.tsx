"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Eye, EyeOff} from "lucide-react";
import {useSession} from "next-auth/react";
import {PAGES_URLS} from "@/utils/constants/general.constants";

export default function IndicesPreview() {
    const {status} = useSession();
    const isAuthenticated = status === "authenticated";

    const previewIndices = [
        {
            id: "1",
            name: "Profit Extra 5",
            assets: ["Solana", "BNB", "Bitcoin", "XRP", "Ethereum"],
            performance24h: 0.85,
            performance7d: 0.14,
            totalReturn: 2976.34,
            duration: "4 years 9 months",
        },
        {
            id: "2",
            name: "Optimal Extra 5",
            assets: ["Solana", "BNB", "Bitcoin", "XRP", "Ethereum"],
            performance24h: 0.8,
            performance7d: 0.79,
            totalReturn: 2303.66,
            duration: "4 years 9 months",
        },
        {
            id: "3",
            name: "Maxdrawdown Extra 5",
            assets: ["BNB", "Bitcoin", "Ethereum", "XRP", "Solana"],
            performance24h: 0.76,
            performance7d: 1.37,
            totalReturn: 1705.92,
            duration: "4 years 9 months",
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Performing Crypto Indices</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our most successful crypto index strategies with proven track records
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-full bg-white rounded-lg border">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Index
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assets
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        24h %
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        7d %
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Return
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewIndices.map(index => (
                                    <tr key={index.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{index.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {index.assets.slice(0, 3).map(asset => (
                                                    <Badge key={asset} variant="secondary" className="text-xs">
                                                        {asset}
                                                    </Badge>
                                                ))}
                                                {index.assets.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{index.assets.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-green-600 font-medium">
                                                +{index.performance24h.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-green-600 font-medium">
                                                +{index.performance7d.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative">
                                                {!isAuthenticated && (
                                                    <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                                <span className={`font-medium ${!isAuthenticated ? "blur-sm" : ""}`}>
                                                    {index.totalReturn.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index.duration}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link href={PAGES_URLS.indices}>
                        <Button size="lg" variant="outline">
                            View All Indices
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
