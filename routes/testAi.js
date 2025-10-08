import express from "express";
import {
  generatePepTalk,
  analyzeSentiment,
  detectBurnout,
  summarizeEntries,
} from "../services/aiService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const sampleEntries = [
      { entry_date: "2024-06-01", mood: 3, journal: "Feeling okay." },
      { entry_date: "2024-06-02", mood: 2, journal: "A bit tired." },
      { entry_date: "2024-06-03", mood: 1, journal: "Very stressed." },
      { entry_date: "2024-06-04", mood: 2, journal: "Still tired." },
      { entry_date: "2024-06-05", mood: 4, journal: "Better today." },
    ];

    const pepTalk = await generatePepTalk(2, "Feeling stressed", "gentle");
    const sentiment = await analyzeSentiment(2, "Feeling stressed");
    const burnout = detectBurnout(sampleEntries);
    const summary = await summarizeEntries(sampleEntries);

    res.json({
      pepTalk,
      sentiment,
      burnout,
      summary,
    });
  } catch (err) {
    console.error("Error in test AI route:", err);
    res.status(500).json({ error: "AI service test failed" });
  }
});

export default router;
