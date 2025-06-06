/*
  # Add Interests Schema

  1. New Tables
    - interests
      - id (uuid, primary key)
      - name (text, unique, not null)
      - created_at (timestamptz)
    
    - user_interests (junction table)
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - interest_id (uuid, references interests)
      - created_at (timestamptz)

  2. Changes
    - Remove interests array from user_profiles
    - Add indexes and foreign key constraints
    - Enable RLS and add appropriate policies

  3. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public read access to interests
      - Authenticated users can manage their interests
*/

-- Create interests table
CREATE TABLE interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_interests junction table
CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest_id uuid REFERENCES interests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- Create indexes
CREATE INDEX interests_name_idx ON interests(name);
CREATE INDEX user_interests_user_id_idx ON user_interests(user_id);
CREATE INDEX user_interests_interest_id_idx ON user_interests(interest_id);

-- Remove interests array from user_profiles
ALTER TABLE user_profiles DROP COLUMN interests;

-- Enable Row Level Security
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- Interests policies
CREATE POLICY "Allow public read interests"
  ON interests
  FOR SELECT
  TO public
  USING (true);

-- User interests policies
CREATE POLICY "Users can read own interests"
  ON user_interests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON user_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON user_interests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert predefined interests
INSERT INTO interests (name) VALUES
  ('Sports'),
  ('Art'),
  ('Music'),
  ('Gaming'),
  ('Technology'),
  ('Science'),
  ('Nature'),
  ('Animals'),
  ('Reading/Writing'),
  ('Religion'),
  ('Cooking'),
  ('Travel'),
  ('Movies'),
  ('Photography'),
  ('Dance'),
  ('History'),
  ('Cars'),
  ('Fashion'),
  ('Fitness'),
  ('Meditation')
ON CONFLICT (name) DO NOTHING;