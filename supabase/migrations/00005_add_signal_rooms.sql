-- Create Signal Rooms table (Ephemeral Communities)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  topic_id TEXT REFERENCES topics(id),
  
  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null if system generated
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add room_id to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_room_id ON posts(room_id);

-- RLS Policies for Rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Everyone can read active rooms
CREATE POLICY "Public read active rooms" ON rooms 
FOR SELECT USING (is_active = TRUE AND expires_at > NOW());

-- Only system/admin (or specific logic) can create rooms for now
-- user_id match policy omitted for V1 (System Generated)

-- Function to check room expiry on post insert
CREATE OR REPLACE FUNCTION check_room_active()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = NEW.room_id AND is_active = TRUE AND expires_at > NOW()) THEN
        RAISE EXCEPTION 'Room has expired or is inactive.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_room_expiry
BEFORE INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION check_room_active();

-- Comment
COMMENT ON TABLE rooms IS 'Ephemeral 24-hour chat rooms based on emotional themes.';
