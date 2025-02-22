import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        // Specify files to lint only in the `/src` folder
        files: ["src/**/*.{js,jsx,ts,tsx}"], // Limit linting to `/src`
        excludedFiles: ["**/*.d.ts"], // Exclude TypeScript declaration files, optional
        rules: {
            "@typescript-eslint/no-explicit-any": "warn", // Set 'any' as a warning instead of an error
        },
    },
    {
        ignorePatterns: ["**/*"], // Ignore everything outside
    },
];

export default eslintConfig;
