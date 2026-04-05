// Import mysql2 so Node.js can connect to MySQL
const mysql = require("mysql2");

// Load environment variables from the .env file
require("dotenv").config();

/*
  Create the database connection.
  Values are read from .env, with fallback defaults for local development.
*/
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "expense_tracker",
});

/*
  Attempt to connect to the MySQL database.
  If the connection fails, print the error.
  If it succeeds, confirm that the backend is connected.
*/
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Export the database connection so it can be used in server.js
module.exports = db;