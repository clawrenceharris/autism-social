import { supabase } from "../lib/supabase";
import type { Scenario } from "../types";

export interface ScenarioGoalLinkage {
  scenario_id: string;
  goal_id: string;
  created_at?: string;
}

export interface ScenarioInterestLinkage {
  scenario_id: string;
  interest_id: string;
  created_at?: string;
}

export interface ScenarioWithLinkages extends Scenario {
  goalIds: string[];
  interestIds: string[];
  goalNames: string[];
  interestNames: string[];
}

/**
 * Link a scenario to multiple goals
 */
export async function linkScenarioToGoals(
  scenarioId: string,
  goalIds: string[]
): Promise<void> {
  if (goalIds.length === 0) return;

  const linkages = goalIds.map(goalId => ({
    scenario_id: scenarioId,
    goal_id: goalId,
  }));

  const { error } = await supabase
    .from("scenario_goals")
    .insert(linkages);

  if (error) throw error;
}

/**
 * Link a scenario to multiple interests
 */
export async function linkScenarioToInterests(
  scenarioId: string,
  interestIds: string[]
): Promise<void> {
  if (interestIds.length === 0) return;

  const linkages = interestIds.map(interestId => ({
    scenario_id: scenarioId,
    interest_id: interestId,
  }));

  const { error } = await supabase
    .from("scenario_interests")
    .insert(linkages);

  if (error) throw error;
}

/**
 * Update scenario goal linkages (replace existing with new ones)
 */
export async function updateScenarioGoals(
  scenarioId: string,
  goalIds: string[]
): Promise<void> {
  // Remove existing linkages
  const { error: deleteError } = await supabase
    .from("scenario_goals")
    .delete()
    .eq("scenario_id", scenarioId);

  if (deleteError) throw deleteError;

  // Add new linkages
  if (goalIds.length > 0) {
    await linkScenarioToGoals(scenarioId, goalIds);
  }
}

/**
 * Update scenario interest linkages (replace existing with new ones)
 */
export async function updateScenarioInterests(
  scenarioId: string,
  interestIds: string[]
): Promise<void> {
  // Remove existing linkages
  const { error: deleteError } = await supabase
    .from("scenario_interests")
    .delete()
    .eq("scenario_id", scenarioId);

  if (deleteError) throw deleteError;

  // Add new linkages
  if (interestIds.length > 0) {
    await linkScenarioToInterests(scenarioId, interestIds);
  }
}

/**
 * Get all scenarios with their goal and interest linkages
 */
export async function getScenariosWithLinkages(): Promise<ScenarioWithLinkages[]> {
  const [scenariosResult, scenarioGoalsResult, scenarioInterestsResult] = await Promise.all([
    supabase.from("scenarios").select("*"),
    supabase.from("scenario_goals").select("scenario_id, goal_id, goals(goal)"),
    supabase.from("scenario_interests").select("scenario_id, interest_id, interests(name)")
  ]);

  if (scenariosResult.error) throw scenariosResult.error;
  if (scenarioGoalsResult.error) throw scenarioGoalsResult.error;
  if (scenarioInterestsResult.error) throw scenarioInterestsResult.error;

  const scenarios = scenariosResult.data || [];
  const scenarioGoals = scenarioGoalsResult.data || [];
  const scenarioInterests = scenarioInterestsResult.data || [];

  return scenarios.map(scenario => {
    const scenarioGoalData = scenarioGoals.filter(sg => sg.scenario_id === scenario.id);
    const scenarioInterestData = scenarioInterests.filter(si => si.scenario_id === scenario.id);

    return {
      ...scenario,
      goalIds: scenarioGoalData.map(sg => sg.goal_id),
      interestIds: scenarioInterestData.map(si => si.interest_id),
      goalNames: scenarioGoalData.map(sg => sg.goals?.goal).filter(Boolean) as string[],
      interestNames: scenarioInterestData.map(si => si.interests?.name).filter(Boolean) as string[]
    };
  });
}

/**
 * Get scenarios linked to specific goals
 */
export async function getScenariosByGoals(goalIds: string[]): Promise<Scenario[]> {
  if (goalIds.length === 0) return [];

  const { data, error } = await supabase
    .from("scenario_goals")
    .select("scenarios(*)")
    .in("goal_id", goalIds);

  if (error) throw error;

  // Remove duplicates and extract scenarios
  const scenarioMap = new Map();
  data?.forEach(sg => {
    if (sg.scenarios) {
      scenarioMap.set(sg.scenarios.id, sg.scenarios);
    }
  });

  return Array.from(scenarioMap.values());
}

/**
 * Get scenarios linked to specific interests
 */
export async function getScenariosByInterests(interestIds: string[]): Promise<Scenario[]> {
  if (interestIds.length === 0) return [];

  const { data, error } = await supabase
    .from("scenario_interests")
    .select("scenarios(*)")
    .in("interest_id", interestIds);

  if (error) throw error;

  // Remove duplicates and extract scenarios
  const scenarioMap = new Map();
  data?.forEach(si => {
    if (si.scenarios) {
      scenarioMap.set(si.scenarios.id, si.scenarios);
    }
  });

  return Array.from(scenarioMap.values());
}

/**
 * Remove all linkages for a scenario (useful when deleting scenarios)
 */
export async function removeScenarioLinkages(scenarioId: string): Promise<void> {
  const [goalsResult, interestsResult] = await Promise.all([
    supabase.from("scenario_goals").delete().eq("scenario_id", scenarioId),
    supabase.from("scenario_interests").delete().eq("scenario_id", scenarioId)
  ]);

  if (goalsResult.error) throw goalsResult.error;
  if (interestsResult.error) throw interestsResult.error;
}

/**
 * Get goal and interest counts for a scenario
 */
export async function getScenarioLinkageCounts(scenarioId: string): Promise<{
  goalCount: number;
  interestCount: number;
}> {
  const [goalsResult, interestsResult] = await Promise.all([
    supabase.from("scenario_goals").select("*", { count: "exact", head: true }).eq("scenario_id", scenarioId),
    supabase.from("scenario_interests").select("*", { count: "exact", head: true }).eq("scenario_id", scenarioId)
  ]);

  if (goalsResult.error) throw goalsResult.error;
  if (interestsResult.error) throw interestsResult.error;

  return {
    goalCount: goalsResult.count || 0,
    interestCount: interestsResult.count || 0
  };
}