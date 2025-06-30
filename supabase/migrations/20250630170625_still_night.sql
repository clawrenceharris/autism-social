/*
  # Add published field to dialogues table

  1. Changes
    - Add published boolean field to dialogues table with default true
    - Update existing dialogues to have published = true

  2. Security
    - No changes to RLS policies
*/

-- Add published field to dialogues table with default true
ALTER TABLE dialogues 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Update any existing dialogues to have published = true
UPDATE dialogues SET published = true WHERE published IS NULL;

-- Add comment to explain the field
COMMENT ON COLUMN dialogues.published IS 'Indicates whether the dialogue is published and available to users';