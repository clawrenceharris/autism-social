/*
  # Create user_completed_dialogues Table

  1. New Tables
    - user_completed_dialogues
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - dialogue_id (uuid, references dialogues)
      - scoring (jsonb, stores category scores)
      - completed_at (timestamptz)

  2. Security
    - Enable RLS on user_completed_dialogues table
    - Add policies for authenticated users to manage their own completion data

  3. Indexes
    - Index on user_id for efficient queries
    - Index on dialogue_id for joins
    - Unique constraint on user_id + dialogue_id to prevent duplicates
*/

-- Create user_completed_dialogues table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_completed_dialogues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dialogue_id uuid REFERENCES dialogues(id) ON DELETE CASCADE NOT NULL,
  scoring jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, dialogue_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_completed_dialogues_user_id_idx ON user_completed_dialogues(user_id);
CREATE INDEX IF NOT EXISTS user_completed_dialogues_dialogue_id_idx ON user_completed_dialogues(dialogue_id);
CREATE INDEX IF NOT EXISTS user_completed_dialogues_completed_at_idx ON user_completed_dialogues(completed_at);

-- Enable Row Level Security
ALTER TABLE user_completed_dialogues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own completed dialogues"
  ON user_completed_dialogues
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed dialogues"
  ON user_completed_dialogues
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completed dialogues"
  ON user_completed_dialogues
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completed dialogues"
  ON user_completed_dialogues
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);