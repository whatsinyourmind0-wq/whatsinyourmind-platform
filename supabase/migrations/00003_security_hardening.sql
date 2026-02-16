-- 00003_security_hardening.sql

-- 1. HARD CONSTRAINT: Content Length
-- Prevents "Buffer Overflow" attacks with 10MB strings
ALTER TABLE posts 
ADD CONSTRAINT content_length_check 
CHECK (char_length(content) <= 500);

-- 2. SERVER-SIDE RATE LIMITING
-- Function to check if user posted recently
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

-- Trigger to run BEFORE every INSERT on posts
CREATE TRIGGER trigger_rate_limit_posts
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION check_post_rate_limit();
