/*
  # Add Dialogue Completion Functions

  1. Functions
    - complete_dialogue() - Atomic function to handle dialogue completion
    - get_progress_percentages() - Calculate display percentages for progress
    - update_user_interests() - Helper function for user interest management
    - update_user_goals() - Helper function for user goal management
    - get_recommended_dialogues() - Get personalized dialogue recommendations

  2. Security
    - Functions use SECURITY DEFINER for proper RLS handling
    - Input validation and error handling
    - Atomic transactions to prevent data corruption
*/

-- Function to atomically complete a dialogue and update progress
CREATE OR REPLACE FUNCTION complete_dialogue(
  p_user_id uuid,
  p_dialogue_id uuid,
  p_scores jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_completion uuid;
  v_current_progress user_progress%ROWTYPE;
  v_new_progress user_progress%ROWTYPE;
  v_result jsonb;
BEGIN
  -- Check if dialogue is already completed by this user
  SELECT id INTO v_existing_completion
  FROM user_completed_dialogues
  WHERE user_id = p_user_id AND dialogue_id = p_dialogue_id;

  IF v_existing_completion IS NOT NULL THEN
    RAISE EXCEPTION 'Dialogue already completed by user';
  END IF;

  -- Get current progress (create if doesn't exist)
  SELECT * INTO v_current_progress
  FROM user_progress
  WHERE user_id = p_user_id;

  IF v_current_progress IS NULL THEN
    INSERT INTO user_progress (user_id, clarity, empathy, assertiveness, social_awareness, self_advocacy)
    VALUES (p_user_id, 0, 0, 0, 0, 0)
    RETURNING * INTO v_current_progress;
  END IF;

  -- Insert completion record with scores
  INSERT INTO user_completed_dialogues (user_id, dialogue_id, scores, completed_at)
  VALUES (p_user_id, p_dialogue_id, p_scores, now());

  -- Update progress with new scores
  UPDATE user_progress
  SET 
    clarity = LEAST(100, clarity + COALESCE((p_scores->>'clarity')::integer, 0)),
    empathy = LEAST(100, empathy + COALESCE((p_scores->>'empathy')::integer, 0)),
    assertiveness = LEAST(100, assertiveness + COALESCE((p_scores->>'assertiveness')::integer, 0)),
    social_awareness = LEAST(100, social_awareness + COALESCE((p_scores->>'socialAwareness')::integer, 0)),
    self_advocacy = LEAST(100, self_advocacy + COALESCE((p_scores->>'selfAdvocacy')::integer, 0))
  WHERE user_id = p_user_id
  RETURNING * INTO v_new_progress;

  -- Return both old and new progress for animation
  v_result := jsonb_build_object(
    'success', true,
    'previous_progress', jsonb_build_object(
      'clarity', v_current_progress.clarity,
      'empathy', v_current_progress.empathy,
      'assertiveness', v_current_progress.assertiveness,
      'social_awareness', v_current_progress.social_awareness,
      'self_advocacy', v_current_progress.self_advocacy
    ),
    'new_progress', jsonb_build_object(
      'clarity', v_new_progress.clarity,
      'empathy', v_new_progress.empathy,
      'assertiveness', v_new_progress.assertiveness,
      'social_awareness', v_new_progress.social_awareness,
      'self_advocacy', v_new_progress.self_advocacy
    ),
    'scores_earned', p_scores
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to complete dialogue: %', SQLERRM;
END;
$$;

-- Function to get progress percentages for display
CREATE OR REPLACE FUNCTION get_progress_percentages(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress user_progress%ROWTYPE;
  v_total_dialogues integer;
  v_completed_dialogues integer;
  v_result jsonb;
BEGIN
  -- Get user progress
  SELECT * INTO v_progress
  FROM user_progress
  WHERE user_id = p_user_id;

  -- If no progress exists, return zeros
  IF v_progress IS NULL THEN
    RETURN jsonb_build_object(
      'clarity', 0,
      'empathy', 0,
      'assertiveness', 0,
      'social_awareness', 0,
      'self_advocacy', 0,
      'overall', 0,
      'completed_dialogues', 0,
      'total_dialogues', 0
    );
  END IF;

  -- Get dialogue completion stats
  SELECT COUNT(*) INTO v_completed_dialogues
  FROM user_completed_dialogues
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_total_dialogues
  FROM dialogues;

  -- Calculate overall progress (average of all categories)
  v_result := jsonb_build_object(
    'clarity', v_progress.clarity,
    'empathy', v_progress.empathy,
    'assertiveness', v_progress.assertiveness,
    'social_awareness', v_progress.social_awareness,
    'self_advocacy', v_progress.self_advocacy,
    'overall', ROUND((v_progress.clarity + v_progress.empathy + v_progress.assertiveness + v_progress.social_awareness + v_progress.self_advocacy) / 5.0),
    'completed_dialogues', v_completed_dialogues,
    'total_dialogues', v_total_dialogues
  );

  RETURN v_result;
END;
$$;

-- Function to update user interests (replace existing)
CREATE OR REPLACE FUNCTION update_user_interests(
  user_uuid uuid,
  new_interests text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interest_record record;
  interest_id uuid;
BEGIN
  -- Delete existing user interests
  DELETE FROM user_interests WHERE user_id = user_uuid;

  -- Insert new interests
  FOREACH interest_record.name IN ARRAY new_interests
  LOOP
    -- Get or create interest
    SELECT id INTO interest_id
    FROM interests
    WHERE name = interest_record.name;

    IF interest_id IS NULL THEN
      INSERT INTO interests (name)
      VALUES (interest_record.name)
      RETURNING id INTO interest_id;
    END IF;

    -- Link user to interest
    INSERT INTO user_interests (user_id, interest_id)
    VALUES (user_uuid, interest_id)
    ON CONFLICT (user_id, interest_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Function to update user goals (replace existing)
CREATE OR REPLACE FUNCTION update_user_goals(
  user_uuid uuid,
  new_goals text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  goal_text text;
  goal_id uuid;
BEGIN
  -- Delete existing user goals
  DELETE FROM user_goals WHERE user_id = user_uuid;

  -- Insert new goals
  FOREACH goal_text IN ARRAY new_goals
  LOOP
    -- Get goal ID
    SELECT id INTO goal_id
    FROM goals
    WHERE goal = goal_text;

    IF goal_id IS NOT NULL THEN
      -- Link user to goal
      INSERT INTO user_goals (user_id, goal_id)
      VALUES (user_uuid, goal_id)
      ON CONFLICT (user_id, goal_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Function to get recommended dialogues based on user preferences
CREATE OR REPLACE FUNCTION get_recommended_dialogues(
  user_uuid uuid,
  limit_count integer DEFAULT 10
) RETURNS TABLE (
  id uuid,
  scenario_id uuid,
  title text,
  persona_tags text[],
  introduction text,
  placeholders text[],
  steps jsonb,
  difficulty text,
  scoring_categories text[],
  created_at timestamptz,
  actor_id uuid,
  match_score integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      array_agg(DISTINCT i.name) as user_interests,
      array_agg(DISTINCT g.goal) as user_goals
    FROM user_interests ui
    LEFT JOIN interests i ON ui.interest_id = i.id
    LEFT JOIN user_goals ug ON ug.user_id = ui.user_id
    LEFT JOIN goals g ON ug.goal_id = g.id
    WHERE ui.user_id = user_uuid
  ),
  dialogue_scores AS (
    SELECT 
      d.*,
      COALESCE(
        (
          SELECT COUNT(*)
          FROM dialogue_interests di
          JOIN interests i ON di.interest_id = i.id
          WHERE di.dialogue_id = d.id 
          AND i.name = ANY(up.user_interests)
        ) +
        (
          SELECT COUNT(*)
          FROM dialogue_goals dg
          JOIN goals g ON dg.goal_id = g.id
          WHERE dg.dialogue_id = d.id 
          AND g.goal = ANY(up.user_goals)
        ), 0
      ) as match_score
    FROM dialogues d
    CROSS JOIN user_preferences up
    WHERE d.id NOT IN (
      SELECT dialogue_id 
      FROM user_completed_dialogues 
      WHERE user_id = user_uuid
    )
  )
  SELECT 
    ds.id,
    ds.scenario_id,
    ds.title,
    ds.persona_tags,
    ds.introduction,
    ds.placeholders,
    ds.steps,
    ds.difficulty,
    ds.scoring_categories,
    ds.created_at,
    ds.actor_id,
    ds.match_score
  FROM dialogue_scores ds
  ORDER BY ds.match_score DESC, ds.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Create the missing user_completed_dialogues table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_completed_dialogues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dialogue_id uuid REFERENCES dialogues(id) ON DELETE CASCADE NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, dialogue_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_completed_dialogues_user_id_idx ON user_completed_dialogues(user_id);
CREATE INDEX IF NOT EXISTS user_completed_dialogues_dialogue_id_idx ON user_completed_dialogues(dialogue_id);
CREATE INDEX IF NOT EXISTS user_completed_dialogues_completed_at_idx ON user_completed_dialogues(completed_at);

-- Enable RLS
ALTER TABLE user_completed_dialogues ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read own completed dialogues"
  ON user_completed_dialogues
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed dialogues"
  ON user_completed_dialogues
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION complete_dialogue(uuid, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_progress_percentages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_interests(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_goals(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_dialogues(uuid, integer) TO authenticated;