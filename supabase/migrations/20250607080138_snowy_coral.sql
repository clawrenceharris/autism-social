/*
  # Create scenario linkage tables

  1. New Tables
    - `scenario_goals`
      - `scenario_id` (uuid, foreign key to scenarios)
      - `goal_id` (uuid, foreign key to goals)
      - Primary key: (scenario_id, goal_id)
    
    - `scenario_interests`
      - `scenario_id` (uuid, foreign key to scenarios)
      - `interest_id` (uuid, foreign key to interests)
      - Primary key: (scenario_id, interest_id)

  2. Security
    - Enable RLS on both tables
    - Public read access for recommendations
    - Authenticated user access for management operations

  3. Performance
    - Indexes on foreign key columns
    - Cascade delete when parent records are removed
*/

-- Create scenario_goals join table
CREATE TABLE scenario_goals (
  scenario_id uuid NOT NULL,
  goal_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (scenario_id, goal_id),
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- Create scenario_interests join table
CREATE TABLE scenario_interests (
  scenario_id uuid NOT NULL,
  interest_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (scenario_id, interest_id),
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX scenario_goals_scenario_id_idx ON scenario_goals(scenario_id);
CREATE INDEX scenario_goals_goal_id_idx ON scenario_goals(goal_id);
CREATE INDEX scenario_interests_scenario_id_idx ON scenario_interests(scenario_id);
CREATE INDEX scenario_interests_interest_id_idx ON scenario_interests(interest_id);

-- Enable Row Level Security
ALTER TABLE scenario_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_interests ENABLE ROW LEVEL SECURITY;

-- Policies for scenario_goals
CREATE POLICY "Enable read access for all users" ON scenario_goals
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users" ON scenario_goals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON scenario_goals
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON scenario_goals
  FOR DELETE TO authenticated USING (true);

-- Policies for scenario_interests
CREATE POLICY "Enable read access for all users" ON scenario_interests
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users" ON scenario_interests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON scenario_interests
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON scenario_interests
  FOR DELETE TO authenticated USING (true);