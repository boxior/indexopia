// components/benefits-section.tsx
import {Card, CardContent} from "@/components/ui/card";
import {BarChart3, Shield, Globe, Users, Zap, TrendingUp} from "lucide-react";

export default function BenefitsSection() {
    const benefits = [
        {
            icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
            title: "Professional Analytics",
            description: "Advanced charts, metrics, and performance analysis tools used by professional traders.",
        },
        {
            icon: <Shield className="h-8 w-8 text-green-600" />,
            title: "Risk Management",
            description: "Built-in risk assessment tools and portfolio optimization to protect your investments.",
        },
        {
            icon: <Globe className="h-8 w-8 text-purple-600" />,
            title: "Global Markets",
            description: "Access to worldwide crypto markets with real-time data from major exchanges.",
        },
        {
            icon: <Users className="h-8 w-8 text-orange-600" />,
            title: "Community Driven",
            description: "Learn from experienced traders and share strategies with our growing community.",
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-600" />,
            title: "Fast Execution",
            description: "Lightning-fast data processing and real-time portfolio updates.",
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-red-600" />,
            title: "Proven Strategies",
            description: "Access to time-tested investment strategies with documented performance.",
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Indexopia?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Everything you need to build and manage a successful crypto portfolio
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">{benefit.icon}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-gray-600">{benefit.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
