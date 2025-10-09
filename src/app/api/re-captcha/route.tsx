import {NextRequest, NextResponse} from "next/server";
import {ENV_VARIABLES} from "@/env";

export async function POST(req: NextRequest) {
    const {token} = await req.json();

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `secret=${ENV_VARIABLES.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await verifyRes.json();

    if (!data.success || data.score < 0.5) {
        return NextResponse.json({success: false, score: data.score}, {status: 400});
    }

    return NextResponse.json({success: true, score: data.score});
}
