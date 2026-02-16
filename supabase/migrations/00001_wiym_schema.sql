-- ============================================
-- WhatsInYourMind.com — Database Schema (V1 Fresh)
-- "The Anonymous Coffee Shop of the Internet"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== 1. CONFIGURATION (The "CMS" Layer) ==========

-- 1.1 Topics (Dynamic Tables)
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,                          -- e.g., 'the-grind', 'tech'
  name TEXT NOT NULL,                           -- e.g., 'The Grind'
  description TEXT,                             -- e.g., 'Work, hustle, and the daily struggle'
  color TEXT DEFAULT '#ffffff',                 -- Hex color for UI
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- 1.2 Tones (Dynamic Vibes)
CREATE TABLE IF NOT EXISTS tones (
  id TEXT PRIMARY KEY,                          -- e.g., 'frustrated', 'grateful'
  name TEXT NOT NULL,                           -- e.g., 'Frustrated'
  emoji TEXT NOT NULL,                          -- e.g., '😤'
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- 1.3 Compliance Rules (The "Kill Switch")
CREATE TABLE IF NOT EXISTS compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,                    -- e.g., 'IN', 'IN-KA', 'US'
  feature TEXT NOT NULL DEFAULT 'all',          -- 'all', 'posting', 'reading'
  is_blocked BOOLEAN DEFAULT TRUE,
  message TEXT DEFAULT 'Service unavailable in your region.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Reserved Usernames
CREATE TABLE IF NOT EXISTS reserved_usernames (
  username TEXT PRIMARY KEY
);

-- ========== 2. USERS & PROFILES ==========

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  humanity_score INTEGER DEFAULT 0,            -- 0 = unverified, 100 = fully verified
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,             -- Global ban switch
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 3. CONTENT (The "Flow") ==========

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  
  -- Relational Links to Config
  topic_id TEXT NOT NULL REFERENCES topics(id), 
  tone_id TEXT NOT NULL REFERENCES tones(id),

  -- Metadata
  auto_tags TEXT[] DEFAULT '{}',                -- AI-detected tags (Shadow tags)
  life_force INTEGER DEFAULT 100,               -- Discovery "Energy" (Resonance keeps this high)
  
  -- Counters (Denormalized for performance)
  resonance_count INTEGER DEFAULT 0,            -- Formerly 'heart_count'
  comment_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  
  is_void BOOLEAN DEFAULT FALSE,                -- Auto-routed to "The Void"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 4. INTERACTIONS (The "Pulse") ==========

-- 4.1 Resonance (Replaces Hearts)
CREATE TABLE IF NOT EXISTS resonance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)                      -- One resonance per user per post
);

-- 4.2 Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Flags/Reports
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending',                -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Feedback / Requests
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be anonymous
  type TEXT NOT NULL,                           -- 'feature', 'bug', 'complaint', 'other'
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  status TEXT DEFAULT 'open',                   -- 'open', 'reviewed', 'implemented'
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========== 5. SECURITY (RLS) ==========

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tones ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resonance ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Public Config (Read Only)
CREATE POLICY "Public can read active topics" ON topics FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active tones" ON tones FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read compliance rules" ON compliance_rules FOR SELECT USING (true); -- Backend needs to read this

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Resonance
CREATE POLICY "Resonance is viewable by everyone" ON resonance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can resonate" ON resonance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can un-resonate" ON resonance FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Flags
CREATE POLICY "Flags hidden from public" ON flags FOR SELECT USING (false);
CREATE POLICY "Authenticated users can flag" ON flags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback
CREATE POLICY "Feedback hidden from public" ON feedback FOR SELECT USING (false);
CREATE POLICY "Authenticated can submit feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (Optional: Allow anon feedback if needed, but for now strict to auth users to prevent spam)


-- ========== 6. TRIGGERS (Auto-Counters) ==========

-- Resonance Counter
CREATE OR REPLACE FUNCTION update_resonance_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET resonance_count = resonance_count + 1, life_force = life_force + 5 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET resonance_count = resonance_count - 1, life_force = life_force - 5 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resonance_count
AFTER INSERT OR DELETE ON resonance
FOR EACH ROW EXECUTE FUNCTION update_resonance_count();

-- Comment Counter
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1, life_force = life_force + 10 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();


-- ========== 7. SEED DATA (Defaults) ==========

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
