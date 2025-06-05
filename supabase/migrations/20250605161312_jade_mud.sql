/*
  # Allow public access to scenarios and dialogues

  1. Changes
    - Drop existing RLS policies
    - Create new policies allowing public access
    - Remove user_id constraints
  
  2. Security
    - Enable public read/write access to all tables
    - Remove authentication requirements
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can create scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON scenarios;

DROP POLICY IF EXISTS "Users can read own dialogues" ON dialogues;
DROP POLICY IF EXISTS "Users can create dialogues" ON dialogues;
DROP POLICY IF EXISTS "Users can update own dialogues" ON dialogues;
DROP POLICY IF EXISTS "Users can delete own dialogues" ON dialogues;

-- Make user_id nullable
ALTER TABLE scenarios ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE dialogues ALTER COLUMN user_id DROP NOT NULL;

-- Create new public access policies for scenarios
CREATE POLICY "Allow public read scenarios"
  ON scenarios
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public create scenarios"
  ON scenarios
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update scenarios"
  ON scenarios
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete scenarios"
  ON scenarios
  FOR DELETE
  TO public
  USING (true);

-- Create new public access policies for dialogues
CREATE POLICY "Allow public read dialogues"
  ON dialogues
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public create dialogues"
  ON dialogues
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update dialogues"
  ON dialogues
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete dialogues"
  ON dialogues
  FOR DELETE
  TO public
  USING (true);