import mysql from "mysql2/promise";
import {ENV_VARIABLES} from "@/env";

// Set up the MySQL connection
export const mySqlPool = mysql.createPool({
    host: ENV_VARIABLES.MYSQL_HOST, // Replace with your MySQL host
    user: ENV_VARIABLES.MYSQL_USER, // Replace with your MySQL username
    password: ENV_VARIABLES.MYSQL_PASSWORD, // Replace with your MySQL password
    database: ENV_VARIABLES.MYSQL_DATABASE, // Replace with your MySQL database name
    waitForConnections: true,
    connectionLimit: 50,
    maxIdle: 0,
    idleTimeout: 0,
    queueLimit: 0,
});
