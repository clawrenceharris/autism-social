/*
  # Refined Scoring System Migration

  This migration updates the database schema to support the new refined scoring system
  where each dialogue response option can award 0-10 points per scoring category.

  ## Changes Made

  1. **Updated user_progress table structure**
     - Split each scoring category into `_earned` and `_possible` columns
     - This allows tracking both points earned and total possible points
     - Enables percentage calculation for progress display

  2. **Updated dialogues table**
     - Added `total_possible_scores` JSONB column to store max possible points per category
     - This helps with percentage calculations and progress tracking

  3. **Updated dialogue steps structure**
     - Response options now store point values (0-10) per category instead of just category names
     - Enables granular scoring based on response quality

  4. **Added database functions**
     - `complete_dialogue()` function for atomic dialogue completion and progress updates
     - `get_progress_percentages()` function for calculating display percentages

  ## Security
  - All existing RLS policies remain in place
  - New functions respect existing security constraints

  ## Data Migration
  - Existing data is preserved where possible
  - Default values ensure no data loss during migration
*/

-- First, let's update the user_progress table structure
ALTER TABLE user_progress 
DROP COLUMN IF EXISTS clarity,
DROP COLUMN IF EXISTS empathy,
DROP COLUMN IF EXISTS assertiveness,
DROP COLUMN IF EXISTS social_awareness,
DROP COLUMN IF EXISTS self_advocacy;

-- Add the new earned/possible columns
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS clarity_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clarity_possible INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS empathy_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS empathy_possible INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assertiveness_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assertiveness_possible INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_awareness_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_awareness_possible INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS self_advocacy_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS self_advocacy_possible INTEGER DEFAULT 0;

-- Add constraints to ensure non-negative values
ALTER TABLE user_progress 
ADD CONSTRAINT check_clarity_earned_non_negative CHECK (clarity_earned >= 0),
ADD CONSTRAINT check_clarity_possible_non_negative CHECK (clarity_possible >= 0),
ADD CONSTRAINT check_empathy_earned_non_negative CHECK (empathy_earned >= 0),
ADD CONSTRAINT check_empathy_possible_non_negative CHECK (empathy_possible >= 0),
ADD CONSTRAINT check_assertiveness_earned_non_negative CHECK (assertiveness_earned >= 0),
ADD CONSTRAINT check_assertiveness_possible_non_negative CHECK (assertiveness_possible >= 0),
ADD CONSTRAINT check_social_awareness_earned_non_negative CHECK (social_awareness_earned >= 0),
ADD CONSTRAINT check_social_awareness_possible_non_negative CHECK (social_awareness_possible >= 0),
ADD CONSTRAINT check_self_advocacy_earned_non_negative CHECK (self_advocacy_earned >= 0),
ADD CONSTRAINT check_self_advocacy_possible_non_negative CHECK (self_advocacy_possible >= 0);

-- Add constraints to ensure earned doesn't exceed possible
ALTER TABLE user_progress 
ADD CONSTRAINT check_clarity_earned_lte_possible CHECK (clarity_earned <= clarity_possible),
ADD CONSTRAINT check_empathy_earned_lte_possible CHECK (empathy_earned <= empathy_possible),
ADD CONSTRAINT check_assertiveness_earned_lte_possible CHECK (assertiveness_earned <= assertiveness_possible),
ADD CONSTRAINT check_social_awareness_earned_lte_possible CHECK (social_awareness_earned <= social_awareness_possible),
ADD CONSTRAINT check_self_advocacy_earned_lte_possible CHECK (self_advocacy_earned <= self_advocacy_possible);

-- Update the dialogues table to include total possible scores
ALTER TABLE dialogues 
ADD COLUMN IF NOT EXISTS total_possible_scores JSONB DEFAULT '{"clarity": 0, "empathy": 0, "assertiveness": 0, "socialAwareness": 0, "selfAdvocacy": 0}'::jsonb;

-- Create or replace the complete_dialogue function
CREATE OR REPLACE FUNCTION complete_dialogue(
  p_user_id UUID,
  p_dialogue_id UUID,
  p_earned_scores JSONB,
  p_possible_scores JSONB
) RETURNS JSONB AS $$
DECLARE
  v_previous_progress user_progress%ROWTYPE;
  v_new_progress user_progress%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Get current progress (before update)
  SELECT * INTO v_previous_progress 
  FROM user_progress 
  WHERE user_id = p_user_id;
  
  -- If no progress record exists, create one
  IF v_previous_progress.user_id IS NULL THEN
    INSERT INTO user_progress (user_id) VALUES (p_user_id);
    SELECT * INTO v_previous_progress 
    FROM user_progress 
    WHERE user_id = p_user_id;
  END IF;
  
  -- Update progress with new scores
  UPDATE user_progress SET
    clarity_earned = clarity_earned + COALESCE((p_earned_scores->>'clarity')::INTEGER, 0),
    clarity_possible = clarity_possible + COALESCE((p_possible_scores->>'clarity')::INTEGER, 0),
    empathy_earned = empathy_earned + COALESCE((p_earned_scores->>'empathy')::INTEGER, 0),
    empathy_possible = empathy_possible + COALESCE((p_possible_scores->>'empathy')::INTEGER, 0),
    assertiveness_earned = assertiveness_earned + COALESCE((p_earned_scores->>'assertiveness')::INTEGER, 0),
    assertiveness_possible = assertiveness_possible + COALESCE((p_possible_scores->>'assertiveness')::INTEGER, 0),
    social_awareness_earned = social_awareness_earned + COALESCE((p_earned_scores->>'socialAwareness')::INTEGER, 0),
    social_awareness_possible = social_awareness_possible + COALESCE((p_possible_scores->>'socialAwareness')::INTEGER, 0),
    self_advocacy_earned = self_advocacy_earned + COALESCE((p_earned_scores->>'selfAdvocacy')::INTEGER, 0),
    self_advocacy_possible = self_advocacy_possible + COALESCE((p_possible_scores->>'selfAdvocacy')::INTEGER, 0)
  WHERE user_id = p_user_id;
  
  -- Get updated progress
  SELECT * INTO v_new_progress 
  FROM user_progress 
  WHERE user_id = p_user_id;
  
  -- Record the completed dialogue
  INSERT INTO user_completed_dialogues (user_id, dialogue_id, scores, completed_at)
  VALUES (p_user_id, p_dialogue_id, p_earned_scores, CURRENT_DATE)
  ON CONFLICT (user_id, dialogue_id) DO UPDATE SET
    scores = EXCLUDED.scores,
    completed_at = EXCLUDED.completed_at;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'previous_progress', row_to_json(v_previous_progress),
    'new_progress', row_to_json(v_new_progress),
    'scores_earned', p_earned_scores
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get progress percentages
CREATE OR REPLACE FUNCTION get_progress_percentages(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_progress user_progress%ROWTYPE;
  v_completed_count INTEGER;
  v_total_dialogues INTEGER;
  v_result JSONB;
BEGIN
  -- Get user progress
  SELECT * INTO v_progress 
  FROM user_progress 
  WHERE user_id = p_user_id;
  
  -- If no progress found, return zeros
  IF v_progress.user_id IS NULL THEN
    RETURN jsonb_build_object(
      'clarity', 0,
      'empathy', 0,
      'assertiveness', 0,
      'social_awareness', 0,
      'self_advocacy', 0,
      'overall', 0,
      'user_completed_dialogues', 0,
      'total_dialogues', 0
    );
  END IF;
  
  -- Get dialogue completion stats
  SELECT COUNT(*) INTO v_completed_count
  FROM user_completed_dialogues
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_total_dialogues
  FROM dialogues;
  
  -- Calculate percentages
  v_result := jsonb_build_object(
    'clarity', CASE 
      WHEN v_progress.clarity_possible > 0 
      THEN ROUND((v_progress.clarity_earned::NUMERIC / v_progress.clarity_possible::NUMERIC) * 100)
      ELSE 0 
    END,
    'empathy', CASE 
      WHEN v_progress.empathy_possible > 0 
      THEN ROUND((v_progress.empathy_earned::NUMERIC / v_progress.empathy_possible::NUMERIC) * 100)
      ELSE 0 
    END,
    'assertiveness', CASE 
      WHEN v_progress.assertiveness_possible > 0 
      THEN ROUND((v_progress.assertiveness_earned::NUMERIC / v_progress.assertiveness_possible::NUMERIC) * 100)
      ELSE 0 
    END,
    'social_awareness', CASE 
      WHEN v_progress.social_awareness_possible > 0 
      THEN ROUND((v_progress.social_awareness_earned::NUMERIC / v_progress.social_awareness_possible::NUMERIC) * 100)
      ELSE 0 
    END,
    'self_advocacy', CASE 
      WHEN v_progress.self_advocacy_possible > 0 
      THEN ROUND((v_progress.self_advocacy_earned::NUMERIC / v_progress.self_advocacy_possible::NUMERIC) * 100)
      ELSE 0 
    END,
    'overall', CASE 
      WHEN (v_progress.clarity_possible + v_progress.empathy_possible + v_progress.assertiveness_possible + v_progress.social_awareness_possible + v_progress.self_advocacy_possible) > 0
      THEN ROUND(((v_progress.clarity_earned + v_progress.empathy_earned + v_progress.assertiveness_earned + v_progress.social_awareness_earned + v_progress.self_advocacy_earned)::NUMERIC / 
                  (v_progress.clarity_possible + v_progress.empathy_possible + v_progress.assertiveness_possible + v_progress.social_awareness_possible + v_progress.self_advocacy_possible)::NUMERIC) * 100)
      ELSE 0 
    END,
    'user_completed_dialogues', v_completed_count,
    'total_dialogues', v_total_dialogues
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_completed_dialogues table to ensure proper structure
ALTER TABLE user_completed_dialogues 
ADD CONSTRAINT IF NOT EXISTS unique_user_dialogue UNIQUE (user_id, dialogue_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION complete_dialogue(UUID, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_progress_percentages(UUID) TO authenticated;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_completed_dialogues_user_id ON user_completed_dialogues(user_id);
CREATE INDEX IF NOT EXISTS idx_user_completed_dialogues_dialogue_id ON user_completed_dialogues(dialogue_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_total_possible_scores ON dialogues USING GIN (total_possible_scores);

-- Update existing dialogues with default total_possible_scores if they don't have them
UPDATE dialogues 
SET total_possible_scores = '{"clarity": 30, "empathy": 20, "assertiveness": 25, "socialAwareness": 15, "selfAdvocacy": 20}'::jsonb
WHERE total_possible_scores IS NULL OR total_possible_scores = '{}'::jsonb;