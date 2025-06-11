/*
  # Create daily_challenges table

  1. New Tables
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `day_of_week` (integer, 0-6 where 0=Sunday)
      - `dialogue_id` (uuid, foreign key to dialogues)
      - `week_start_date` (date, start of the week)
      - `is_active` (boolean, whether challenge is active)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_challenges` table
    - Add policy for public read access
    - Add policy for authenticated users to manage challenges

  3. Indexes
    - Index on day_of_week for efficient queries
    - Index on week_start_date for weekly queries
    - Index on dialogue_id for joins
*/

CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  dialogue_id uuid NOT NULL,
  week_start_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE daily_challenges 
ADD CONSTRAINT daily_challenges_dialogue_id_fkey 
FOREIGN KEY (dialogue_id) REFERENCES dialogues(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS daily_challenges_day_of_week_idx ON daily_challenges(day_of_week);
CREATE INDEX IF NOT EXISTS daily_challenges_week_start_date_idx ON daily_challenges(week_start_date);
CREATE INDEX IF NOT EXISTS daily_challenges_dialogue_id_idx ON daily_challenges(dialogue_id);

-- Enable RLS
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for all users"
  ON daily_challenges
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON daily_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON daily_challenges
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON daily_challenges
  FOR DELETE
  TO authenticated
  USING (true);