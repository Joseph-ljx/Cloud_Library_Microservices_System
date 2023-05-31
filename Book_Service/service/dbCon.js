// Database import
const mysql = require("mysql");

// Access the .env object
require("dotenv").config();

// Database Connection
// *** Remember to change ***
let con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Connect
con.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server: " + con.config.host);
});

module.exports = con;
