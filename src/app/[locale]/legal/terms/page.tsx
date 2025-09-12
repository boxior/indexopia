import {getLegalDocument} from "@/lib/legal-content";
import {Metadata} from "next";

export default async function Terms() {
    const {content} = await getLegalDocument("terms");

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{__html: content}} />
        </div>
    );
}

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms and conditions for using our service",
};
