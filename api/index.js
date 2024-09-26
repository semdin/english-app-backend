const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const app = express();
const pool = require("../db"); // Ensure the path is correct

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Root route
app.get("/", (req, res) => {
  res.send("Word Game Backend is running!");
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get words for a specific category
app.get("/api/words/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await pool.query(
      `SELECT w.* FROM words w
       INNER JOIN word_categories wc ON w.id = wc.word_id
       WHERE wc.category_id = $1`,
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get example sentences for a word in a category
app.get("/api/examples/:wordId/:categoryId", async (req, res) => {
  const { wordId, categoryId } = req.params;
  try {
    const result = await pool.query(
      `SELECT sentence FROM example_sentences
       WHERE word_id = $1 AND category_id = $2`,
      [wordId, categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Save user progress
app.post("/api/user-progress", async (req, res) => {
  const { userId = 0, categoryId, lastWordId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, category_id, last_word_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category_id)
       DO UPDATE SET last_word_id = EXCLUDED.last_word_id RETURNING *`,
      [userId, categoryId, lastWordId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get user progress
app.get("/api/user-progress/:userId/:categoryId", async (req, res) => {
  const { userId = 0, categoryId } = req.params;
  try {
    const result = await pool.query(
      `SELECT last_word_id FROM user_progress
       WHERE user_id = $1 AND category_id = $2`,
      [userId, categoryId]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ last_word_id: null });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Export the handler for Vercel
module.exports.handler = serverless(app);
