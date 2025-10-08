// routes/entries.js
import express from "express";
import { addEntry, getEntries, getStats, getWeeklySummary, autoUpdateMood } from "../controllers/entriesController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, addEntry);      
router.post("/auto-mood", auth, autoUpdateMood);  // ⭐ NEW: Auto-update mood endpoint
router.get("/", auth, getEntries);     
router.get("/stats", auth, getStats);  
router.get("/summary", auth, getWeeklySummary); 

export default router;
