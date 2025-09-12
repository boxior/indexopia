import {getLegalDocument} from "@/lib/legal-content";
import {Metadata} from "next";

export default async function Privacy() {
    const {content} = await getLegalDocument("privacy");

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{__html: content}} />
        </div>
    );
}

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Read about how we collect, use, and protect your data",
};
