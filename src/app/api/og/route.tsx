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

        const title = searchParams.get("title") || "The Ultimate Crypto Index Platform";
        const description =
            searchParams.get("description") ||
            "Professional-grade indices with real-time tracking and institutional tools";

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
                        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #faf5ff 100%)",
                        padding: "60px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
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
                                fontSize: "28px",
                                fontWeight: "700",
                                color: "#111827",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    background: "linear-gradient(135deg, #2563eb, #9333ea)",
                                    borderRadius: "8px",
                                    marginRight: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    color: "#ffffff",
                                }}
                            >
                                IX
                            </div>
                            Indexopia
                        </div>
                        {/* Domain */}
                        <div
                            style={{
                                fontSize: "20px",
                                color: "#6b7280",
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
                                fontSize: "64px",
                                fontWeight: "700",
                                color: "#111827",
                                lineHeight: "1.1",
                                marginBottom: "20px",
                                maxWidth: "900px",
                            }}
                        >
                            {title}
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                fontSize: "32px",
                                color: "#4b5563",
                                lineHeight: "1.4",
                                marginBottom: "40px",
                                maxWidth: "800px",
                            }}
                        >
                            {description}
                        </p>

                        {/* Feature Cards */}
                        <div
                            style={{
                                display: "flex",
                                gap: "20px",
                                marginTop: "20px",
                            }}
                        >
                            {[
                                {name: "Real-Time Tracking", icon: "📈", color: "#3b82f6"},
                                {name: "Professional Tools", icon: "🛡️", color: "#9333ea"},
                                {name: "Thousands of Assets", icon: "⚡", color: "#059669"},
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "20px 24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        minWidth: "180px",
                                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "16px",
                                            color: "#111827",
                                            fontWeight: "600",
                                            textAlign: "center",
                                        }}
                                    >
                                        {feature.name}
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
                                fontSize: "18px",
                                color: "#6b7280",
                                fontWeight: "500",
                            }}
                        >
                            Institutional-Grade Crypto Indices
                        </div>
                        <div
                            style={{
                                fontSize: "18px",
                                color: "#6b7280",
                                fontWeight: "500",
                            }}
                        >
                            Start Building Today
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-50px",
                            right: "-50px",
                            width: "200px",
                            height: "200px",
                            background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
                            borderRadius: "50%",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: "-50px",
                            left: "-50px",
                            width: "150px",
                            height: "150px",
                            background: "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
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
