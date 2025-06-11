/*
  # Create daily_challenges table

  1. New Tables
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `day_of_week` (integer, 0-6 representing Sunday-Saturday)
      - `dialogue_id` (uuid, foreign key to dialogues table)
      - `week_start_date` (date, the Sunday date for the week)
      - `is_active` (boolean, whether the challenge is currently active)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_challenges` table
    - Add policy for public read access to daily challenges
    - Add policy for authenticated users to manage daily challenges

  3. Indexes
    - Add index on dialogue_id for efficient joins
    - Add index on week_start_date and day_of_week for efficient queries
    - Add unique constraint on (day_of_week, week_start_date) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  dialogue_id uuid NOT NULL,
  week_start_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to dialogues table
ALTER TABLE daily_challenges 
ADD CONSTRAINT fk_daily_challenges_dialogue_id 
FOREIGN KEY (dialogue_id) REFERENCES dialogues(id) ON DELETE CASCADE;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS daily_challenges_dialogue_id_idx ON daily_challenges(dialogue_id);
CREATE INDEX IF NOT EXISTS daily_challenges_week_date_idx ON daily_challenges(week_start_date);
CREATE INDEX IF NOT EXISTS daily_challenges_day_week_idx ON daily_challenges(day_of_week);

-- Add unique constraint to prevent duplicate challenges for the same day/week
CREATE UNIQUE INDEX IF NOT EXISTS daily_challenges_unique_day_week 
ON daily_challenges(day_of_week, week_start_date);

-- Enable RLS
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
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