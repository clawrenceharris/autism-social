/*
  # Add Dialogue Recommendations System

  1. New Tables
    - dialogue_goals (junction table)
      - id (uuid, primary key)
      - dialogue_id (uuid, references dialogues)
      - goal_id (uuid, references goals)
      - created_at (timestamptz)
    
    - dialogue_interests (junction table)
      - id (uuid, primary key)
      - dialogue_id (uuid, references dialogues)
      - interest_id (uuid, references interests)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public access
*/

-- Create dialogue_goals junction table
CREATE TABLE dialogue_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogue_id uuid REFERENCES dialogues(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(dialogue_id, goal_id)
);

-- Create dialogue_interests junction table
CREATE TABLE dialogue_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogue_id uuid REFERENCES dialogues(id) ON DELETE CASCADE NOT NULL,
  interest_id uuid REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(dialogue_id, interest_id)
);

-- Create indexes
CREATE INDEX dialogue_goals_dialogue_id_idx ON dialogue_goals(dialogue_id);
CREATE INDEX dialogue_goals_goal_id_idx ON dialogue_goals(goal_id);
CREATE INDEX dialogue_interests_dialogue_id_idx ON dialogue_interests(dialogue_id);
CREATE INDEX dialogue_interests_interest_id_idx ON dialogue_interests(interest_id);

-- Enable Row Level Security
ALTER TABLE dialogue_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_interests ENABLE ROW LEVEL SECURITY;

-- Dialogue goals policies
CREATE POLICY "Allow public read dialogue goals"
  ON dialogue_goals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert dialogue goals"
  ON dialogue_goals
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update dialogue goals"
  ON dialogue_goals
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete dialogue goals"
  ON dialogue_goals
  FOR DELETE
  TO public
  USING (true);

-- Dialogue interests policies
CREATE POLICY "Allow public read dialogue interests"
  ON dialogue_interests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert dialogue interests"
  ON dialogue_interests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update dialogue interests"
  ON dialogue_interests
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete dialogue interests"
  ON dialogue_interests
  FOR DELETE
  TO public
  USING (true);