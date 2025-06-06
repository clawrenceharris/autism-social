/*
  # Add Scenario Recommendations System

  1. New Tables
    - goals
      - id (uuid, primary key)
      - goal (text, unique, not null)
      - created_at (timestamptz)
    
    - user_goals (junction table)
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - goal_id (uuid, references goals)
      - created_at (timestamptz)
    
    - scenario_goals (junction table)
      - id (uuid, primary key)
      - scenario_id (uuid, references scenarios)
      - goal_id (uuid, references goals)
      - created_at (timestamptz)
    
    - scenario_interests (junction table)
      - id (uuid, primary key)
      - scenario_id (uuid, references scenarios)
      - interest_id (uuid, references interests)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Create goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_goals junction table
CREATE TABLE user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goal_id)
);

-- Create scenario_goals junction table
CREATE TABLE scenario_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scenario_id, goal_id)
);

-- Create scenario_interests junction table
CREATE TABLE scenario_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  interest_id uuid REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scenario_id, interest_id)
);

-- Create indexes
CREATE INDEX goals_goal_idx ON goals(goal);
CREATE INDEX user_goals_user_id_idx ON user_goals(user_id);
CREATE INDEX user_goals_goal_id_idx ON user_goals(goal_id);
CREATE INDEX scenario_goals_scenario_id_idx ON scenario_goals(scenario_id);
CREATE INDEX scenario_goals_goal_id_idx ON scenario_goals(goal_id);
CREATE INDEX scenario_interests_scenario_id_idx ON scenario_interests(scenario_id);
CREATE INDEX scenario_interests_interest_id_idx ON scenario_interests(interest_id);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_interests ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Allow public read goals"
  ON goals
  FOR SELECT
  TO public
  USING (true);

-- User goals policies
CREATE POLICY "Users can read own goals"
  ON user_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Scenario goals policies
CREATE POLICY "Allow public read scenario goals"
  ON scenario_goals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert scenario goals"
  ON scenario_goals
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update scenario goals"
  ON scenario_goals
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete scenario goals"
  ON scenario_goals
  FOR DELETE
  TO public
  USING (true);

-- Scenario interests policies
CREATE POLICY "Allow public read scenario interests"
  ON scenario_interests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert scenario interests"
  ON scenario_interests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update scenario interests"
  ON scenario_interests
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete scenario interests"
  ON scenario_interests
  FOR DELETE
  TO public
  USING (true);

-- Insert predefined goals
INSERT INTO goals (goal) VALUES
  ('Improve workplace communication'),
  ('Build confidence in social situations'),
  ('Practice job interview skills'),
  ('Learn conflict resolution'),
  ('Develop networking abilities'),
  ('Enhance dating and relationship skills'),
  ('Improve family communication'),
  ('Build friendships'),
  ('Practice public speaking'),
  ('Learn to set boundaries'),
  ('Develop leadership skills'),
  ('Improve customer service skills')
ON CONFLICT (goal) DO NOTHING;