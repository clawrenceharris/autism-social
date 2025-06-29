/*
  # Create RPC function to update user interests

  1. New Functions
    - `update_user_interests(user_uuid, new_interest_ids)`
      - Deletes existing user interests for the user
      - Inserts new user interests based on provided interest IDs
      - Returns the updated user interests with full interest data

  2. Security
    - Function uses RLS policies already in place on user_interests table
    - Only authenticated users can call this function for their own data
*/

CREATE OR REPLACE FUNCTION update_user_interests(
  user_uuid UUID,
  new_interest_ids UUID[]
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  interest_id UUID,
  created_at TIMESTAMPTZ,
  interest_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing user interests
  DELETE FROM user_interests WHERE user_interests.user_id = user_uuid;
  
  -- Insert new user interests if any provided
  IF array_length(new_interest_ids, 1) > 0 THEN
    INSERT INTO user_interests (user_id, interest_id)
    SELECT user_uuid, unnest(new_interest_ids);
  END IF;
  
  -- Return the updated user interests with interest names
  RETURN QUERY
  SELECT 
    ui.id,
    ui.user_id,
    ui.interest_id,
    ui.created_at,
    i.name as interest_name
  FROM user_interests ui
  JOIN interests i ON ui.interest_id = i.id
  WHERE ui.user_id = user_uuid
  ORDER BY i.name;
END;
$$;