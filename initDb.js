// initDb.js
import fs from "fs";
import path from "path";
import pool from "./db.js";

export async function initDb() {
  try {
    // ✅ Always resolve absolute path safely (handles spaces + hyphens)
    const schemaPath = path.resolve("./sql/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("✅ Database initialized / already up-to-date");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  }
}

// If run directly: `npm run db:init`
if (process.argv[1].includes("initDb.js")) {
  initDb().then(() => process.exit(0));
}
