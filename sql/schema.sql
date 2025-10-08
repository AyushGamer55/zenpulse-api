-- sql/schema.sql

-- 🧑 Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  pep_tone TEXT DEFAULT 'gentle', 
  created_at TIMESTAMP DEFAULT NOW()
);

-- 📓 Entries table
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core data
  mood INT CHECK (mood >= 1 AND mood <= 5),
  mood_auto_updated BOOLEAN DEFAULT false,  -- ⭐ NEW: Track if mood was auto-updated
  journal TEXT,
  tasks_completed INT DEFAULT 0,
  pomodoros INT DEFAULT 0,
  notes TEXT,

  -- AI insights
  sentiment TEXT,               
  ai_pep_talk TEXT,              
  burnout_risk BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (user_id, entry_date)
);