-- ============================================
-- MASTER SCHEMA V1 (2026-02-17) 🍉
-- ============================================
-- This is the "OMR Sheet" / Single Source of Truth for the Database.
-- Run this ENTIRE script to reset & fix everything at once.
-- Includes:
-- 1. Full Reset (Tables, Types, Enums)
-- 2. Security Policies (RLS) - FIXED for Public Access
-- 3. Functions & Triggers (Rate Limits, Counters)
-- 4. Initial Seed Data (Topics, Tones)

-- ⚠️ WARNING: This will NOT delete existing data if tables exist.
-- It uses "IF NOT EXISTS" to be safe.

-- ========== 1. ENABLE EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== 2. CONFIG TABLES ==========
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,
  feature TEXT NOT NULL DEFAULT 'all',
  is_blocked BOOLEAN DEFAULT TRUE,
  message TEXT DEFAULT 'Service unavailable.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reserved_usernames (
  username TEXT PRIMARY KEY
);

-- ========== 3. USER PROFILES ==========
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  humanity_score INTEGER DEFAULT 0, 
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 4. POSTS (With Pulse & Security) ==========
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000), -- Hard Limit (Security)
  
  topic_id TEXT NOT NULL REFERENCES topics(id), 
  tone_id TEXT NOT NULL REFERENCES tones(id),

  -- Metadata
  auto_tags TEXT[] DEFAULT '{}',
  life_force INTEGER DEFAULT 100,
  
  -- Counters
  resonance_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  
  is_void BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Pulse Location Data (Phase 3)
  location_iso TEXT DEFAULT 'UNKNOWN',
  location_name TEXT DEFAULT 'Somewhere',
  location_lat FLOAT,
  location_lng FLOAT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_location_iso ON posts (location_iso);

-- ========== 5. INTERACTIONS ==========
CREATE TABLE IF NOT EXISTS resonance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========== 6. SECURITY: RLS POLICIES (Row Level Security) ==========
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tones ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resonance ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 6.1. GRANT USAGE (The Fix for 'permission denied')
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 6.2. Apply Policies
-- (We use DROP POLICY IF EXISTS to make this script re-runnable)

-- Topics/Tones/Compliance (Public Read)
DROP POLICY IF EXISTS "Public read topics" ON topics;
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tones" ON tones;
CREATE POLICY "Public read tones" ON tones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read compliance" ON compliance_rules;
CREATE POLICY "Public read compliance" ON compliance_rules FOR SELECT USING (true);

-- Profiles
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts
DROP POLICY IF EXISTS "Public read posts" ON posts;
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth create posts" ON posts;
CREATE POLICY "Auth create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Auth delete posts" ON posts;
CREATE POLICY "Auth delete posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Resonance
DROP POLICY IF EXISTS "Public read resonance" ON resonance;
CREATE POLICY "Public read resonance" ON resonance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth create resonance" ON resonance;
CREATE POLICY "Auth create resonance" ON resonance FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth delete resonance" ON resonance;
CREATE POLICY "Auth delete resonance" ON resonance FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Public read comments" ON comments;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth create comments" ON comments;
CREATE POLICY "Auth create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Flags & Feedback (Write Only)
DROP POLICY IF EXISTS "Auth create flags" ON flags;
CREATE POLICY "Auth create flags" ON flags FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth create feedback" ON feedback;
CREATE POLICY "Auth create feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== 7. SECURITY: RATE LIMITING (The "Antigravity" Shield) ==========
-- 1 Post per 5 Minutes per User.
CREATE OR REPLACE FUNCTION check_post_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_post_time TIMESTAMPTZ;
BEGIN
  SELECT created_at INTO last_post_time FROM posts WHERE user_id = NEW.user_id ORDER BY created_at DESC LIMIT 1;
  IF last_post_time IS NOT NULL AND (NOW() - last_post_time) < INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Rate Limit Exceeded: One thought every 5 minutes allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rate_limit_posts ON posts;
CREATE TRIGGER trigger_rate_limit_posts BEFORE INSERT ON posts FOR EACH ROW EXECUTE FUNCTION check_post_rate_limit();


-- ========== 8. TRIGGERS (Counters) ==========
-- Resonance Counter
CREATE OR REPLACE FUNCTION update_resonance_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE posts SET resonance_count = resonance_count + 1, life_force = life_force + 5 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE posts SET resonance_count = resonance_count - 1, life_force = life_force - 5 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resonance_count ON resonance;
CREATE TRIGGER trigger_resonance_count AFTER INSERT OR DELETE ON resonance FOR EACH ROW EXECUTE FUNCTION update_resonance_count();

-- Comment Counter
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comment_count ON comments;
CREATE TRIGGER trigger_comment_count AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_comment_count();


-- ========== 9. SEED DATA ==========
INSERT INTO topics (id, name, description, color, sort_order) VALUES
('the-grind', 'The Grind', 'Work, hustle, and the daily struggle', '#FF3B30', 1),
('the-void', 'The Void', 'Thoughts into the abyss', '#8E8E93', 99),
('tech-life', 'Tech Life', 'Code, bugs, and machines', '#007AFF', 2),
('quiet-corner', 'Quiet Corner', 'Peaceful observations', '#34C759', 3),
('shower-thoughts', 'Shower Thoughts', 'Epiphanies and what-ifs', '#AF52DE', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tones (id, name, emoji, sort_order) VALUES
('casual', 'Casual', '☕', 1),
('frustrated', 'Frustrated', '😤', 2),
('grateful', 'Grateful', '🙏', 3),
('reflective', 'Reflective', '🤔', 4),
('excited', 'Excited', '⚡', 5)
ON CONFLICT (id) DO NOTHING;

-- DONE.
