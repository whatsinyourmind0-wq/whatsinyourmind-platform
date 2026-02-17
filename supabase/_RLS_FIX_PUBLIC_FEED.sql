-- ============================================
-- RLS FIX: PUBLIC FEED ACCESS 🔓
-- ============================================
-- The previous policies "USING (true)" sometimes fail for the 'anon' role
-- if permissions are not explicitly granted. This script fixes it.

-- 1. Grant Usage on Schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant Select on Feature Tables
GRANT SELECT ON TABLE posts TO anon, authenticated;
GRANT SELECT ON TABLE profiles TO anon, authenticated;
GRANT SELECT ON TABLE topics TO anon, authenticated;
GRANT SELECT ON TABLE tones TO anon, authenticated;
GRANT SELECT ON TABLE resonance TO anon, authenticated;
GRANT SELECT ON TABLE comments TO anon, authenticated;

-- 3. Ensure RLS Policies exist (Idempotent check)
-- (We drop and recreate the critical ones just to be sure)

DROP POLICY IF EXISTS "Public read posts" ON posts;
CREATE POLICY "Public read posts" ON posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
