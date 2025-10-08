import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import { initDb } from "./initDb.js";

import authRoutes from "./routes/auth.js";
import entriesRoutes from "./routes/entries.js";
import chatRoutes from "./routes/chat.js";
import testAiRoutes from "./routes/testAi.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://zenpulse-ui.vercel.app"], // Allow frontend origin
  credentials: true // Allow credentials if needed
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize DB once at startup
initDb();

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "ZenPulse API running 🚀", time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/entries", entriesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/test-ai", testAiRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
