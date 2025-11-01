import zlib from "zlib";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {ENV_VARIABLES} from "@/env";

// Secret key for encryption and decryption (Make sure to keep this secret and secure)
const SECRET_KEY = ENV_VARIABLES.SSL_SECRET_KEY; // Replace with a securely stored key
const ALGORITHM = ENV_VARIABLES.SSL_ALGORITHM;

// Function to encrypt with compression
function encodeSsl(data) {
    // Compress the data
    const compressed = zlib.deflateSync(data);

    // Generate random Initialization Vector (IV)
    const iv = crypto.randomBytes(16);

    // Create cipher with the secret key and IV
    const cipher = crypto.createCipheriv(ALGORITHM, crypto.scryptSync(SECRET_KEY, "salt", 32), iv);

    // Encrypt the compressed data
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);

    // Combine IV and encrypted data, then encode in Base64
    return Buffer.concat([iv, encrypted]).toString("base64");
}

// Function to decrypt and decompress
export function decodeSsl(encoded) {
    // Decode from Base64 back to binary
    const binaryData = Buffer.from(encoded, "base64");

    // Extract IV and encrypted data
    const iv = binaryData.slice(0, 16);
    const encryptedData = binaryData.slice(16);

    // Create decipher with the secret key and IV
    const decipher = crypto.createDecipheriv(ALGORITHM, crypto.scryptSync(SECRET_KEY, "salt", 32), iv);

    // Decrypt the data
    const decompressed = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    // Decompress the decrypted data to get the original string
    return zlib.inflateSync(decompressed).toString();
}

// Define the path to the file
const pemFilePath = path.resolve("./certs/eu-central-1-bundle.pem");

// Function to read the original PEM file
function readPemFile(filePath) {
    try {
        // Read the file synchronously
        const fileContents = fs.readFileSync(filePath, "utf-8");
        return fileContents; // Return the file contents as a string
    } catch (error) {
        console.error("Error reading the PEM file:", error.message);
        throw error; // Re-throw the error after logging
    }
}

(() => {
    // Backoffice func to encode cert.
    try {
        // const original = readPemFile(pemFilePath);
        // const encoded = encodeSsl(original);
        // const decoded = decodeSsl(encoded);
        // console.log("Original:", original);
        // console.log("Encoded:", encoded);
        // console.log("Decoded:", decoded);
    } catch (error) {
        console.error("Failed to read the PEM file.");
    }
})();
