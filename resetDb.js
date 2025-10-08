// resetDb.js
import fs from "fs";
import pool from "./db.js";

async function resetDb() {
  try {
    console.log("⚠️ Dropping existing tables...");
    await pool.query(`
      DROP TABLE IF EXISTS entries CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log("📜 Rebuilding schema...");
    const schema = fs.readFileSync("./sql/schema.sql", "utf8");
    await pool.query(schema);

    console.log("✅ Database reset complete (fresh tables created)");
  } catch (err) {
    console.error("❌ Error resetting database:", err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

resetDb();
