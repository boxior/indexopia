import mysql from "mysql2/promise";
import {ENV_VARIABLES} from "@/env";
import * as fs from "node:fs";
import path from "path";

// Set up the MySQL connection with optimized pool settings
export const mySqlPool = mysql.createPool({
    host: ENV_VARIABLES.MYSQL_HOST, // Replace with your MySQL host
    user: ENV_VARIABLES.MYSQL_USER, // Replace with your MySQL username
    password: ENV_VARIABLES.MYSQL_PASSWORD, // Replace with your MySQL password
    database: ENV_VARIABLES.MYSQL_DATABASE, // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections in the pool
    queueLimit: 0, // Increased to allow more queries to queue when the pool is busy
    maxIdle: 1, // Allow up to 1 idle connections in the pool
    idleTimeout: 1, // Increase timeout for idle connections (10 seconds)
    ssl: {
        ca: fs.readFileSync(path.join(process.cwd(), "certs", "eu-central-1-bundle.pem")),
    },
});
