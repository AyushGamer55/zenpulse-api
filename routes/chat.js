import express from "express";
import { analyzeSentiment, generatePepTalk } from "../services/aiService.js";
import pool from "../db.js";
import auth from "../middleware/auth.js"; // ⭐ ADD THIS IMPORT

const router = express.Router();

// ⭐ ADD AUTH MIDDLEWARE TO THE ROUTE
router.post("/", auth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get user's actual current mood from database
    const userId = req.user.id; // ✅ Now req.user exists!
    const today = new Date().toISOString().split("T")[0];
    const entryResult = await pool.query(
      "SELECT mood FROM entries WHERE user_id = $1 AND entry_date = $2",
      [userId, today]
    );
    
    const currentMood = entryResult.rows.length > 0 ? entryResult.rows[0].mood : 3;
    console.log(`🎯 Chat API - User mood: ${currentMood}, Message: "${message}"`);

    // Analyze sentiment with actual mood context
    const sentiment = await analyzeSentiment(currentMood, message);
    console.log(`📊 Sentiment analysis result: ${sentiment}`);

    // Generate AI response with user's actual mood
    const aiResponse = await generatePepTalk(currentMood, message, "supportive");

    res.json({
      response: aiResponse,
      sentiment,
      userMood: currentMood
    });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;