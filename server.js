require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js"); // Supabase SDK
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Supabase client initialization
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Root route
app.get("/", (req, res) => {
  res.send("Word Game Backend is running with Supabase!");
});

// Get all categories from Supabase
app.get("/api/categories", async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");
    if (error) throw error;

    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).send("Server Error");
  }
});

// Get words for a specific category
app.get("/api/words/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const { data: words, error } = await supabase
      .from("words")
      .select("id, word, definition") // Adjust based on your table's columns
      .eq("category_id", categoryId); // Assuming category_id exists in words table

    if (error) throw error;
    res.json(words);
  } catch (err) {
    console.error("Error fetching words:", err.message);
    res.status(500).send("Server Error");
  }
});

// Get example sentences for a word in a category
app.get("/api/examples/:wordId/:categoryId", async (req, res) => {
  const { wordId, categoryId } = req.params;
  try {
    const { data: examples, error } = await supabase
      .from("example_sentences")
      .select("sentence")
      .eq("word_id", wordId)
      .eq("category_id", categoryId);

    if (error) throw error;
    res.json(examples);
  } catch (err) {
    console.error("Error fetching examples:", err.message);
    res.status(500).send("Server Error");
  }
});

// Save user progress
app.post("/api/user-progress", async (req, res) => {
  const { userId, categoryId, lastWordId } = req.body;
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        category_id: categoryId,
        last_word_id: lastWordId,
      })
      .select("*"); // Returns the updated or inserted row

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error("Error saving user progress:", err.message);
    res.status(500).send("Server Error");
  }
});

// Get user progress for a specific category
app.get("/api/user-progress/:userId/:categoryId", async (req, res) => {
  const { userId, categoryId } = req.params;
  try {
    const { data: progress, error } = await supabase
      .from("user_progress")
      .select("last_word_id")
      .eq("user_id", userId)
      .eq("category_id", categoryId);

    if (error) throw error;

    if (progress.length > 0) {
      res.json(progress[0]);
    } else {
      res.json({ last_word_id: null });
    }
  } catch (err) {
    console.error("Error fetching user progress:", err.message);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
