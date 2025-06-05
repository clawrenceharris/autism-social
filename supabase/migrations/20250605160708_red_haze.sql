/*
  # Initial Schema Setup for Autism Social

  1. New Tables
    - scenarios
      - id (uuid, primary key)
      - title (text, not null)
      - description (text)
      - created_at (timestamptz)
      - user_id (uuid, references auth.users)
    
    - dialogues
      - id (uuid, primary key)
      - scenario_id (uuid, references scenarios)
      - title (text, not null)
      - persona_tags (text[], not null)
      - placeholders (text[])
      - steps (jsonb, not null)
      - difficulty (text, not null)
      - scoring_categories (text[])
      - created_at (timestamptz)
      - user_id (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new records
      - Update their own records
      - Delete their own records
*/

-- Create scenarios table
CREATE TABLE scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create dialogues table
CREATE TABLE dialogues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  persona_tags text[] NOT NULL DEFAULT '{}',
  placeholders text[] DEFAULT '{}',
  steps jsonb NOT NULL DEFAULT '[]',
  difficulty text NOT NULL DEFAULT 'easy',
  scoring_categories text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes
CREATE INDEX scenarios_user_id_idx ON scenarios(user_id);
CREATE INDEX dialogues_scenario_id_idx ON dialogues(scenario_id);
CREATE INDEX dialogues_user_id_idx ON dialogues(user_id);

-- Enable Row Level Security
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;

-- Scenarios policies
CREATE POLICY "Users can read own scenarios"
  ON scenarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create scenarios"
  ON scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
  ON scenarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios"
  ON scenarios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dialogues policies
CREATE POLICY "Users can read own dialogues"
  ON dialogues
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create dialogues"
  ON dialogues
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dialogues"
  ON dialogues
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dialogues"
  ON dialogues
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);