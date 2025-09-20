import {ImageResponse} from "next/og";
import {NextRequest, NextResponse} from "next/server";
import {ENV_VARIABLES} from "@/env";

export async function POST(_req: NextRequest) {
    try {
        // Get the URL and search parameters
        const searchParams = _req.nextUrl.searchParams;
        // Retrieve the apiKey from the query string
        const apiKey = searchParams.get("apiKey");

        if (!apiKey) {
            return NextResponse.json({error: "API key is missing"}, {status: 401});
        }

        // Validate the API key
        if (apiKey !== ENV_VARIABLES.API_KEY) {
            return NextResponse.json({error: "Invalid API key"}, {status: 403});
        }

        const title = searchParams.get("title") || "Institutional-Grade Crypto Indices";
        const description =
            searchParams.get("description") || "Transparent, rules-based baskets across BTC, ETH, and sectors";

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        background: "linear-gradient(135deg, #0B0B0F 0%, #1A1A2E 50%, #16213E 100%)",
                        padding: "60px",
                        fontFamily: "Inter, system-ui, sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            marginBottom: "40px",
                        }}
                    >
                        {/* Logo */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "#FFFFFF",
                            }}
                        >
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    background: "linear-gradient(45deg, #22C55E, #16A34A)",
                                    borderRadius: "12px",
                                    marginRight: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                📊
                            </div>
                            Indexopia
                        </div>
                        {/* Domain */}
                        <div
                            style={{
                                fontSize: "24px",
                                color: "#94A3B8",
                            }}
                        >
                            indexopia.com
                        </div>
                    </div>

                    {/* Main Content */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            flex: 1,
                            width: "100%",
                        }}
                    >
                        {/* Main Title */}
                        <h1
                            style={{
                                fontSize: "76px",
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                lineHeight: "1.1",
                                marginBottom: "24px",
                                maxWidth: "800px",
                            }}
                        >
                            {title}
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontSize: "42px",
                                color: "#94A3B8",
                                lineHeight: "1.3",
                                marginBottom: "40px",
                                maxWidth: "900px",
                            }}
                        >
                            {description}
                        </p>

                        {/* Mini Index Cards */}
                        <div
                            style={{
                                display: "flex",
                                gap: "24px",
                                marginTop: "20px",
                            }}
                        >
                            {[
                                {name: "BTC+ETH Balanced", change: "+2.4%", positive: true},
                                {name: "Top 10 Index", change: "+5.1%", positive: true},
                                {name: "DeFi Sector", change: "-1.2%", positive: false},
                            ].map((index, i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: "rgba(255, 255, 255, 0.1)",
                                        borderRadius: "12px",
                                        padding: "16px 20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        backdropFilter: "blur(10px)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "18px",
                                            color: "#FFFFFF",
                                            fontWeight: "600",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {index.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "20px",
                                            color: index.positive ? "#22C55E" : "#EF4444",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {index.change}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            marginTop: "40px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "28px",
                                color: "#64748B",
                            }}
                        >
                            Live Market Data
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                color: "#64748B",
                            }}
                        >
                            Updated Daily
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div
                        style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                            width: "300px",
                            height: "300px",
                            background: "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)",
                            borderRadius: "50%",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            width: "200px",
                            height: "200px",
                            background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
                            borderRadius: "50%",
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return NextResponse.json("Failed to generate the image", {status: 500});
    }
}
