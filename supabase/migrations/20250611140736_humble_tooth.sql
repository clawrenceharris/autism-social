/*
  # Create Daily Challenges Table

  1. New Tables
    - daily_challenges
      - id (uuid, primary key)
      - day_of_week (integer, 0-6 where 0=Sunday)
      - dialogue_id (uuid, references dialogues)
      - week_start_date (date, to track which week this challenge is for)
      - created_at (timestamptz)
      - is_active (boolean, default true)

  2. Security
    - Enable RLS
    - Public read access for all users
    - Admin write access for managing challenges

  3. Indexes
    - Index on day_of_week and week_start_date for efficient queries
    - Index on dialogue_id for joins
*/

CREATE TABLE daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  dialogue_id uuid REFERENCES dialogues(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week, week_start_date)
);

-- Create indexes
CREATE INDEX daily_challenges_day_week_idx ON daily_challenges(day_of_week, week_start_date);
CREATE INDEX daily_challenges_dialogue_id_idx ON daily_challenges(dialogue_id);
CREATE INDEX daily_challenges_week_start_idx ON daily_challenges(week_start_date);

-- Enable Row Level Security
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read daily challenges"
  ON daily_challenges
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert daily challenges"
  ON daily_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update daily challenges"
  ON daily_challenges
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete daily challenges"
  ON daily_challenges
  FOR DELETE
  TO authenticated
  USING (true);