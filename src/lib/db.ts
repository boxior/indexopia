import mysql from "mysql2/promise";
import {ENV_VARIABLES} from "@/env";

// Set up the MySQL connection with optimized pool settings
export const mySqlPool = mysql.createPool({
    host: ENV_VARIABLES.MYSQL_HOST, // Replace with your MySQL host
    user: ENV_VARIABLES.MYSQL_USER, // Replace with your MySQL username
    password: ENV_VARIABLES.MYSQL_PASSWORD, // Replace with your MySQL password
    database: ENV_VARIABLES.MYSQL_DATABASE, // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 50, // Max number of connections in the pool
    queueLimit: 100, // Increased to allow more queries to queue when the pool is busy
    maxIdle: 10, // Allow up to 10 idle connections in the pool
    idleTimeout: 60000, // Increase timeout for idle connections (60 seconds)
});
