import fs from "fs";
import path from "path";
import {marked} from "marked";
import createDOMPurify from "dompurify";
import {JSDOM} from "jsdom";
import {getLocale} from "next-intl/server";
import {DEFAULT_LOCALE} from "@/utils/constants/general.constants";

const window = new JSDOM("").window as unknown as Window & typeof globalThis;
const DOMPurify = createDOMPurify(window);

export interface LegalDocument {
    content: string;
    lastModified?: Date;
}

export async function getLegalDocument(filename: string): Promise<LegalDocument> {
    const locale = await getLocale();
    const filePath = path.join(process.cwd(), "content", "legal", `${locale}_${filename}.md`);

    try {
        const fileContent = fs.readFileSync(filePath, "utf8");

        return {
            content: DOMPurify.sanitize(await marked(fileContent)),
        };
    } catch (error) {
        const filePath = path.join(process.cwd(), "content", "legal", `${DEFAULT_LOCALE}_${filename}.md`);
        const fileContent = fs.readFileSync(filePath, "utf8");

        console.error(new Error(`Could not load legal document: ${filename}`));

        return {
            content: DOMPurify.sanitize(await marked(fileContent)),
        };
    }
}
