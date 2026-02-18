-- Add emotion columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS emotion text DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS intensity float DEFAULT 0.5;

-- Create index for faster analytics on pulse page
CREATE INDEX IF NOT EXISTS idx_posts_emotion ON posts(emotion);

-- Comment for documentation
COMMENT ON COLUMN posts.emotion IS 'Dominant emotion of the post (joy, anxiety, sadness, anger, waiting, neutral)';
COMMENT ON COLUMN posts.intensity IS 'Intensity of the emotion from 0.0 to 1.0';
