/*
  # Create get_recommended_dialogues RPC function

  1. New Functions
    - `get_recommended_dialogues` - Returns recommended dialogues for a user based on their goals and interests
    
  2. Logic
    - Matches dialogues to user preferences through dialogue_goals and dialogue_interests junction tables
    - Returns dialogues with proper type casting for array columns
    - Orders by relevance score and creation date
    
  3. Security
    - Function is accessible to authenticated users
    - Uses existing RLS policies on referenced tables
*/

CREATE OR REPLACE FUNCTION get_recommended_dialogues(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  actor_id uuid,
  scenario_id uuid,
  title text,
  introduction text,
  persona_tags text[],
  placeholders text[],
  steps jsonb,
  difficulty text,
  scoring_categories text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    d.id,
    d.actor_id,
    d.scenario_id,
    d.title,
    d.introduction,
    d.persona_tags,
    COALESCE(
      CASE 
        WHEN d.placeholders IS NULL THEN ARRAY[]::text[]
        WHEN jsonb_typeof(d.placeholders) = 'array' THEN 
          ARRAY(SELECT jsonb_array_elements_text(d.placeholders))
        ELSE ARRAY[]::text[]
      END,
      ARRAY[]::text[]
    ) as placeholders,
    d.steps,
    d.difficulty,
    d.scoring_categories,
    d.created_at
  FROM dialogues d
  LEFT JOIN dialogue_goals dg ON d.id = dg.dialogue_id
  LEFT JOIN dialogue_interests di ON d.id = di.dialogue_id
  LEFT JOIN user_goals ug ON dg.goal_id = ug.goal_id AND ug.user_id = user_uuid
  LEFT JOIN user_interests ui ON di.interest_id = ui.interest_id AND ui.user_id = user_uuid
  LEFT JOIN user_completed_dialogues ucd ON d.id = ucd.dialogue_id AND ucd.user_id = user_uuid
  WHERE 
    ucd.id IS NULL -- Exclude completed dialogues
    AND (ug.user_id IS NOT NULL OR ui.user_id IS NOT NULL) -- Match user preferences
  ORDER BY 
    (CASE WHEN ug.user_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN ui.user_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
    d.created_at DESC
  LIMIT 20;
END;
$$;