/*
  # Add user roles table and admin role support

  1. New Tables
    - user_roles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - role (text, not null)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on user_roles table
    - Add policies for authenticated users to read their own role
*/

CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);