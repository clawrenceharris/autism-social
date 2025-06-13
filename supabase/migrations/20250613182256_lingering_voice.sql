/*
  # Create Actors Table and Update Dialogues

  1. New Tables
    - actors
      - id (uuid, primary key)
      - first_name (text, not null)
      - last_name (text, not null)
      - bio (text)
      - voice_id (text)
      - created_at (timestamptz)

  2. Changes
    - Add actor_id column to dialogues table
    - Remove actor jsonb column from dialogues table
    - Add foreign key constraint

  3. Security
    - Enable RLS on actors table
    - Add policies for public read access
    - Add policies for authenticated user management

  4. Data
    - Insert sample actors
    - Update existing dialogues with appropriate actor assignments
*/

-- Create actors table
CREATE TABLE actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  bio text,
  voice_id text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX actors_name_idx ON actors(first_name, last_name);
CREATE INDEX actors_voice_id_idx ON actors(voice_id);

-- Enable Row Level Security
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

-- Actors policies
CREATE POLICY "Allow public read actors"
  ON actors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert actors"
  ON actors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update actors"
  ON actors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete actors"
  ON actors
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample actors with diverse backgrounds suitable for social scenarios
INSERT INTO actors (first_name, last_name, bio, voice_id) VALUES
  ('Sarah', 'Johnson', 'A friendly college student studying psychology. She is outgoing, empathetic, and enjoys meeting new people. Sarah is patient and understanding, making her great for introductory social scenarios.', 'EXAVITQu4vr4xnSDxMaL'),
  ('Marcus', 'Chen', 'A professional workplace mentor and team lead at a tech company. He is confident, direct, and values clear communication. Marcus has experience helping others develop their professional skills.', 'ErXwobaYiN019PkySvjV'),
  ('Emma', 'Rodriguez', 'A warm and approachable teacher who specializes in social skills development. She is patient, encouraging, and skilled at breaking down complex social situations into manageable steps.', 'ThT5KcBeYPX3keUQqHPh'),
  ('David', 'Thompson', 'A casual and laid-back retail worker who enjoys chatting with customers. He is friendly, helpful, and represents everyday social interactions you might encounter while shopping or in service situations.', 'JBFqnCBsd6RMkjVDRZzb'),
  ('Lisa', 'Park', 'A healthcare professional who works as a nurse. She is caring, professional, and experienced in communicating with people during stressful or vulnerable moments. Great for scenarios involving asking for help.', 'XrExE9yKIg1WjnnlVkGX'),
  ('Alex', 'Williams', 'A versatile young professional who works in customer service. They are adaptable, patient, and skilled at handling various personality types and conflict resolution scenarios.', 'pNInz6obpgDQGcFmaJgB'),
  ('Dr. Jennifer', 'Martinez', 'An experienced therapist and social skills coach. She is professional, insightful, and specializes in helping people navigate complex social and emotional situations.', 'XB0fDUnXU5powFXDhCyR'),
  ('Tom', 'Anderson', 'A friendly neighbor and community volunteer. He is approachable, helpful, and represents the kind of person you might interact with in your neighborhood or community events.', 'pqHfZKP75CvOlQylNhV4');

-- Add actor_id column to dialogues table
ALTER TABLE dialogues ADD COLUMN actor_id uuid REFERENCES actors(id);

-- Update existing dialogues with appropriate actor assignments based on context analysis
-- Note: These updates are based on analyzing dialogue titles and contexts

-- Update dialogues with appropriate actors
-- For workplace/professional scenarios - assign Marcus Chen
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Marcus' AND last_name = 'Chen')
WHERE title ILIKE '%interview%' 
   OR title ILIKE '%workplace%' 
   OR title ILIKE '%professional%'
   OR title ILIKE '%job%'
   OR title ILIKE '%meeting%'
   OR title ILIKE '%colleague%';

-- For educational/learning scenarios - assign Emma Rodriguez
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Emma' AND last_name = 'Rodriguez')
WHERE title ILIKE '%learn%' 
   OR title ILIKE '%study%' 
   OR title ILIKE '%school%'
   OR title ILIKE '%class%'
   OR title ILIKE '%education%';

-- For healthcare/help scenarios - assign Lisa Park
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Lisa' AND last_name = 'Park')
WHERE title ILIKE '%help%' 
   OR title ILIKE '%health%' 
   OR title ILIKE '%medical%'
   OR title ILIKE '%doctor%'
   OR title ILIKE '%support%';

-- For conflict/difficult scenarios - assign Dr. Jennifer Martinez
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Dr. Jennifer' AND last_name = 'Martinez')
WHERE title ILIKE '%conflict%' 
   OR title ILIKE '%difficult%' 
   OR title ILIKE '%argument%'
   OR title ILIKE '%disagree%'
   OR title ILIKE '%boundary%'
   OR title ILIKE '%criticism%';

-- For casual/social scenarios - assign Sarah Johnson
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Sarah' AND last_name = 'Johnson')
WHERE title ILIKE '%meet%' 
   OR title ILIKE '%friend%' 
   OR title ILIKE '%social%'
   OR title ILIKE '%party%'
   OR title ILIKE '%casual%'
   OR title ILIKE '%roommate%'
   OR title ILIKE '%new%';

-- For customer service/retail scenarios - assign David Thompson
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'David' AND last_name = 'Thompson')
WHERE title ILIKE '%store%' 
   OR title ILIKE '%shop%' 
   OR title ILIKE '%customer%'
   OR title ILIKE '%service%'
   OR title ILIKE '%retail%'
   OR title ILIKE '%purchase%';

-- For community/neighbor scenarios - assign Tom Anderson
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Tom' AND last_name = 'Anderson')
WHERE title ILIKE '%neighbor%' 
   OR title ILIKE '%community%' 
   OR title ILIKE '%local%'
   OR title ILIKE '%volunteer%';

-- For any remaining dialogues without an actor, assign Alex Williams as the default
UPDATE dialogues 
SET actor_id = (SELECT id FROM actors WHERE first_name = 'Alex' AND last_name = 'Williams')
WHERE actor_id IS NULL;

-- Remove the old actor jsonb column
ALTER TABLE dialogues DROP COLUMN IF EXISTS actor;

-- Make actor_id required for future dialogues
ALTER TABLE dialogues ALTER COLUMN actor_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX dialogues_actor_id_idx ON dialogues(actor_id);