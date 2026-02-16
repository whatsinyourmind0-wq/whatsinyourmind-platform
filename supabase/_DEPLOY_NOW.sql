-- ==========================================
-- FINAL MIGRATION SCRIPT (RUN THIS NOW) 🚀
-- ==========================================
-- This script applies ALL pending changes for Phase 2.5 (Security) & Phase 3 (Pulse).
-- Copy and Paste this into your Supabase SQL Editor.

-- PART 1: SECURITY HARDENING (The Shield) 🛡️
-- 1.1. Prevent "Buffer Overflow" attacks with massive strings
ALTER TABLE posts 
ADD CONSTRAINT content_length_check 
CHECK (char_length(content) <= 2000); -- Raised to 2000 to be safe, UI limits to 2000.

-- 1.2. Server-Side Rate Limiting (The Spam Block)
CREATE OR REPLACE FUNCTION check_post_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_post_time TIMESTAMPTZ;
BEGIN
  -- Check the last post time for this user
  SELECT created_at INTO last_post_time
  FROM posts
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- If they posted within the last 5 minutes (300 seconds), BLOCK IT.
  IF last_post_time IS NOT NULL AND (NOW() - last_post_time) < INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Rate Limit Exceeded: You can only post once every 5 minutes. Thoughts should be rare.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.3. Activate the Trigger
DROP TRIGGER IF EXISTS trigger_rate_limit_posts ON posts;
CREATE TRIGGER trigger_rate_limit_posts
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION check_post_rate_limit();


-- PART 2: THE PULSE (Location Data) 🌍
-- 2.1. Add columns for City/Country to visualize on the 3D Globe
-- We use "IF NOT EXISTS" to avoid errors if you ran it partially.
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS location_iso TEXT DEFAULT 'UNKNOWN',
ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT 'Somewhere',
ADD COLUMN IF NOT EXISTS location_lat FLOAT,
ADD COLUMN IF NOT EXISTS location_lng FLOAT;

-- 2.2. Index for faster map queries
CREATE INDEX IF NOT EXISTS idx_posts_location_iso ON posts (location_iso);

-- ==========================================
-- ✅ DONE.
-- ==========================================
