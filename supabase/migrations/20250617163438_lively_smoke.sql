/*
  # Create User Streaks Table

  1. New Tables
    - user_streaks
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - current_streak (integer, not null, default 0)
      - longest_streak (integer, not null, default 0)
      - last_completion_date (date)
      - last_completion_timezone (text, default 'UTC')
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on user_streaks table
    - Add policies for authenticated users to manage their own streak data

  3. Indexes
    - Index on user_id for efficient queries
    - Unique constraint on user_id to ensure one streak record per user

  4. Functions
    - Auto-update updated_at timestamp on changes
*/

-- Create user_streaks table
CREATE TABLE user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_completion_date date,
  last_completion_timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX user_streaks_user_id_idx ON user_streaks(user_id);
CREATE INDEX user_streaks_last_completion_idx ON user_streaks(last_completion_date);

-- Enable Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own streak data"
  ON user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data"
  ON user_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data"
  ON user_streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streaks_updated_at();

-- Function to safely update or create user streak
CREATE OR REPLACE FUNCTION upsert_user_streak(
  p_user_id uuid,
  p_current_streak integer,
  p_longest_streak integer,
  p_last_completion_date date,
  p_timezone text DEFAULT 'UTC'
) RETURNS user_streaks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result user_streaks%ROWTYPE;
BEGIN
  INSERT INTO user_streaks (
    user_id,
    current_streak,
    longest_streak,
    last_completion_date,
    last_completion_timezone
  )
  VALUES (
    p_user_id,
    p_current_streak,
    p_longest_streak,
    p_last_completion_date,
    p_timezone
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(user_streaks.longest_streak, EXCLUDED.longest_streak),
    last_completion_date = EXCLUDED.last_completion_date,
    last_completion_timezone = EXCLUDED.last_completion_timezone,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_user_streak(uuid, integer, integer, date, text) TO authenticated;