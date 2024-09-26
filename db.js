const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Use the Vercel-provided URL
  ssl: {
    rejectUnauthorized: false, // Important for using SSL connections (Vercel usually requires SSL)
  },
});

module.exports = pool;
