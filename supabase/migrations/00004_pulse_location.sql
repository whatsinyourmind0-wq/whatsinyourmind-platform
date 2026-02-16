-- 00004_pulse_location.sql

-- Add Location columns to Posts table for "The Pulse" 3D Earth
-- We store APPROXIMATE location (City/District level) but NOT precise GPS.

ALTER TABLE posts
ADD COLUMN location_iso TEXT DEFAULT 'UNKNOWN',    -- ISO Country Code (e.g., 'IN')
ADD COLUMN location_name TEXT DEFAULT 'Somewhere', -- City/District Name (e.g., 'Mumbai', 'Pune')
ADD COLUMN location_lat FLOAT,                     -- Latitude (Approx)
ADD COLUMN location_lng FLOAT;                     -- Longitude (Approx)

-- Index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_posts_location_iso ON posts (location_iso);
