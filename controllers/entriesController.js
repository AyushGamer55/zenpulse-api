// controllers/entriesController.js
import pool from "../db.js";
import {
  generatePepTalk,
  analyzeSentiment,
  detectBurnout,
  summarizeEntries,
} from "../services/aiService.js";

// 🧠 Auto-update mood from sentiment analysis
export const autoUpdateMood = async (req, res) => {
  try {
    const { mood } = req.body;
    const userId = req.user.id;
    console.log(`🤖 Auto-update mood requested: mood=${mood}, userId=${userId}`);

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: "Valid mood (1-5) is required" });
    }

    // Check if user already has a mood entry for today
    const today = new Date().toISOString().split("T")[0];
    console.log(`📅 Today date: ${today} (from ${new Date().toISOString()})`);

    const existingEntry = await pool.query(
      `SELECT id, mood, mood_auto_updated FROM entries WHERE user_id = $1 AND entry_date = $2`,
      [userId, today]
    );

    console.log(`📅 Today entry exists: ${existingEntry.rows.length > 0}`);

    if (existingEntry.rows.length > 0) {
      // Update existing entry with auto-updated mood
      console.log(`🔄 Attempting to update entry for user ${userId} on ${today}`);
      const result = await pool.query(
        `UPDATE entries SET 
          mood = $1, 
          mood_auto_updated = true,
          updated_at = NOW() 
         WHERE user_id = $2 AND entry_date = $3
         RETURNING *`,
        [mood, userId, today]
      );

      if (result.rows.length === 0) {
        console.log(`❌ UPDATE affected 0 rows! Entry not found.`);
        console.log(`   Looking for: user_id=${userId}, entry_date=${today}`);
        // Check what entries exist for this user
        const allEntries = await pool.query(`SELECT entry_date, mood, mood_auto_updated FROM entries WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 5`, [userId]);
        console.log(`   Existing entries:`, allEntries.rows);
        return res.status(404).json({ error: "Entry not found for update" });
      }

      console.log(`✅ Updated existing entry: mood=${result.rows[0].mood}, auto_updated=${result.rows[0].mood_auto_updated}`);
      res.json(result.rows[0]);
    } else {
      // Create new entry with auto-updated mood
      console.log(`🆕 Creating new entry for user ${userId} on ${today}`);
      const result = await pool.query(
        `INSERT INTO entries (user_id, entry_date, mood, mood_auto_updated)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [userId, today, mood]
      );
      console.log(`✅ Created new entry: mood=${result.rows[0].mood}, auto_updated=${result.rows[0].mood_auto_updated}`);
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("❌ Auto-update mood error:", err.message);
    res.status(500).json({ error: "Failed to auto-update mood" });
  }
};

// ➕ Add entry with AI insights
export const addEntry = async (req, res) => {
  try {
    const { mood, journal, tasksCompleted, pomodoros, notes, moodAutoUpdated = false } = req.body;
    const userId = req.user.id;

    // Get user tone preference (default: gentle)
    const userResult = await pool.query(
      `SELECT pep_tone FROM users WHERE id = $1`,
      [userId]
    );
    const tone = userResult.rows[0]?.pep_tone || "gentle";

    // AI insights (parallel, resilient)
    const [pepTalkRes, sentimentRes] = await Promise.allSettled([
      generatePepTalk(mood, journal, tone),
      analyzeSentiment(mood, journal),
    ]);

    const pepTalk =
      pepTalkRes.status === "fulfilled"
        ? pepTalkRes.value
        : "Stay motivated and keep going!";
    const sentiment =
      sentimentRes.status === "fulfilled" ? sentimentRes.value : "neutral";

    // Ensure numeric defaults
    const tasks = tasksCompleted || 0;
    const pomos = pomodoros || 0;

    const result = await pool.query(
      `INSERT INTO entries (
        user_id, entry_date, mood, mood_auto_updated, journal, tasks_completed, pomodoros, notes, ai_pep_talk, sentiment
      )
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, entry_date)
      DO UPDATE SET 
        mood = EXCLUDED.mood,
        mood_auto_updated = EXCLUDED.mood_auto_updated,
        journal = EXCLUDED.journal,
        tasks_completed = EXCLUDED.tasks_completed,
        pomodoros = EXCLUDED.pomodoros,
        notes = EXCLUDED.notes,
        ai_pep_talk = EXCLUDED.ai_pep_talk,
        sentiment = EXCLUDED.sentiment,
        updated_at = NOW()
      RETURNING *`,
      [userId, mood, moodAutoUpdated, journal, tasks, pomos, notes, pepTalk, sentiment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ AddEntry error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to add entry" });
  }
};

// 📖 Get last 30 entries
export const getEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM entries WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 30`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GetEntries error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

// 🧮 Burnout check (last 14 entries)
export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM entries WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 14`,
      [userId]
    );

    const burnoutRisk = detectBurnout(result.rows);
    res.json({ burnoutRisk, entries: result.rows });
  } catch (err) {
    console.error("❌ GetStats error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// 📅 Weekly summary
export const getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM entries WHERE user_id = $1 ORDER BY entry_date DESC LIMIT 7`,
      [userId]
    );

    const entriesChrono = result.rows.reverse(); // oldest → newest
    const summary = await summarizeEntries(entriesChrono);

    res.json({ summary });
  } catch (err) {
    console.error("❌ Summary error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};
