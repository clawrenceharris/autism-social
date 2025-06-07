import { supabase } from "../lib/supabase";
import type { Scenario } from "../types";

export interface RecommendedScenario extends Scenario {
  matchScore: number;
  matchReasons: string[];
}

export async function getRecommendedScenarios(userId: string): Promise<RecommendedScenario[]> {
  try {
    // Get user's goals and interests
    const [userGoalsResult, userInterestsResult] = await Promise.all([
      supabase
        .from("user_goals")
        .select("goal_id, goals(goal)")
        .eq("user_id", userId),
      supabase
        .from("user_interests")
        .select("interest_id, interests(name)")
        .eq("user_id", userId)
    ]);

    if (userGoalsResult.error) throw userGoalsResult.error;
    if (userInterestsResult.error) throw userInterestsResult.error;

    const userGoalIds = userGoalsResult.data?.map(ug => ug.goal_id) || [];
    const userInterestIds = userInterestsResult.data?.map(ui => ui.interest_id) || [];

    // If user has no goals or interests, return all scenarios with low match scores
    if (userGoalIds.length === 0 && userInterestIds.length === 0) {
      const { data: allScenarios, error } = await supabase
        .from("scenarios")
        .select("*")
        .limit(10);

      if (error) throw error;

      return (allScenarios || []).map(scenario => ({
        ...scenario,
        matchScore: 0.1,
        matchReasons: ["General recommendation"]
      }));
    }

    // Perform separate queries to avoid relationship issues
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

    // Calculate match scores and reasons
    const recommendedScenarios: RecommendedScenario[] = scenarios
      .map(scenario => {
        // Find goals and interests for this scenario
        const scenarioGoalData = scenarioGoals.filter(sg => sg.scenario_id === scenario.id);
        const scenarioInterestData = scenarioInterests.filter(si => si.scenario_id === scenario.id);

        const scenarioGoalIds = scenarioGoalData.map(sg => sg.goal_id);
        const scenarioInterestIds = scenarioInterestData.map(si => si.interest_id);

        // Calculate goal matches
        const goalMatches = scenarioGoalIds.filter(goalId => userGoalIds.includes(goalId));
        const goalMatchNames = goalMatches.map(goalId => {
          const scenarioGoal = scenarioGoalData.find(sg => sg.goal_id === goalId);
          return scenarioGoal?.goals?.goal;
        }).filter(Boolean);

        // Calculate interest matches
        const interestMatches = scenarioInterestIds.filter(interestId => userInterestIds.includes(interestId));
        const interestMatchNames = interestMatches.map(interestId => {
          const scenarioInterest = scenarioInterestData.find(si => si.interest_id === interestId);
          return scenarioInterest?.interests?.name;
        }).filter(Boolean);

        // Calculate match score (0-1)
        const goalScore = userGoalIds.length > 0 ? goalMatches.length / userGoalIds.length : 0;
        const interestScore = userInterestIds.length > 0 ? interestMatches.length / userInterestIds.length : 0;
        const matchScore = (goalScore * 0.7) + (interestScore * 0.3); // Weight goals more heavily

        // Build match reasons
        const matchReasons: string[] = [];
        if (goalMatchNames.length > 0) {
          matchReasons.push(`Matches your goals: ${goalMatchNames.join(", ")}`);
        }
        if (interestMatchNames.length > 0) {
          matchReasons.push(`Aligns with your interests: ${interestMatchNames.join(", ")}`);
        }
        if (matchReasons.length === 0) {
          matchReasons.push("General recommendation");
        }

        return {
          ...scenario,
          matchScore,
          matchReasons
        };
      })
      .filter(scenario => scenario.matchScore > 0) // Only include scenarios with some match
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score descending
      .slice(0, 10); // Limit to top 10

    return recommendedScenarios;

  } catch (error) {
    console.error("Error getting recommended scenarios:", error);
    throw error;
  }
}

export async function getScenariosByGoal(goalId: string): Promise<Scenario[]> {
  try {
    const { data, error } = await supabase
      .from("scenario_goals")
      .select("scenarios(*)")
      .eq("goal_id", goalId);

    if (error) throw error;

    return data?.map(sg => sg.scenarios).filter(Boolean) || [];
  } catch (error) {
    console.error("Error getting scenarios by goal:", error);
    throw error;
  }
}

export async function getScenariosByInterest(interestId: string): Promise<Scenario[]> {
  try {
    const { data, error } = await supabase
      .from("scenario_interests")
      .select("scenarios(*)")
      .eq("interest_id", interestId);

    if (error) throw error;

    return data?.map(si => si.scenarios).filter(Boolean) || [];
  } catch (error) {
    console.error("Error getting scenarios by interest:", error);
    throw error;
  }
}