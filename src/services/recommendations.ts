import { supabase } from "../lib/supabase";
import type { Scenario } from "../types";

export interface RecommendedScenario extends Scenario {
  matchScore: number;
  matchReasons: string[];
}

export interface UserPreferences {
  goalIds: string[];
  interestIds: string[];
  goals: Array<{ id: string; goal: string }>;
  interests: Array<{ id: string; name: string }>;
}

export interface ScenarioLinkage {
  scenario: Scenario;
  goalIds: string[];
  interestIds: string[];
  goalNames: string[];
  interestNames: string[];
}

export interface RecommendationOptions {
  limit?: number;
  excludeCompletedIds?: string[];
  minMatchScore?: number;
}

/**
 * Fetches user's goals and interests with their details
 */
async function _fetchUserPreferences(userId: string): Promise<UserPreferences> {
  const [userGoalsResult, userInterestsResult] = await Promise.all([
    supabase
      .from("user_goals")
      .select("goal_id, goals(id, goal)")
      .eq("user_id", userId),
    supabase
      .from("user_interests")
      .select("interest_id, interests(id, name)")
      .eq("user_id", userId),
  ]);

  if (userGoalsResult.error) throw userGoalsResult.error;
  if (userInterestsResult.error) throw userInterestsResult.error;

  const goals = (userGoalsResult.data || [])
    .map((ug) => ug.goals)
    .filter(Boolean)
    .flat() as Array<{ id: string; goal: string }>;

  const interests = (userInterestsResult.data || [])
    .map((ui) => ui.interests)
    .flat() as Array<{ id: string; name: string }>;

  return {
    goalIds: goals.map((g) => g.id),
    interestIds: interests.map((i) => i.id),
    goals,
    interests,
  };
}

/**
 * Fetches all scenarios with their associated goals and interests
 */
async function _fetchAllScenarioLinkages(): Promise<ScenarioLinkage[]> {
  const [scenariosResult, scenarioGoalsResult, scenarioInterestsResult] =
    await Promise.all([
      supabase.from("scenarios").select("*"),
      supabase
        .from("scenario_goals")
        .select("scenario_id, goal_id, goals(goal)"),
      supabase
        .from("scenario_interests")
        .select("scenario_id, interest_id, interests(name)"),
    ]);

  if (scenariosResult.error) throw scenariosResult.error;
  if (scenarioGoalsResult.error) throw scenarioGoalsResult.error;
  if (scenarioInterestsResult.error) throw scenarioInterestsResult.error;

  const scenarios = scenariosResult.data || [];
  const scenarioGoals = scenarioGoalsResult.data || [];
  const scenarioInterests = scenarioInterestsResult.data || [];

  return scenarios.map((scenario) => {
    const scenarioGoalData = scenarioGoals.filter(
      (sg) => sg.scenario_id === scenario.id
    );
    const scenarioInterestData = scenarioInterests.filter(
      (si) => si.scenario_id === scenario.id
    );

    return {
      scenario,
      goalIds: scenarioGoalData.map((sg) => sg.goal_id),
      interestIds: scenarioInterestData.map((si) => si.interest_id),
      goalNames: scenarioGoalData
        .flatMap((sg) => sg.goals.flatMap((g) => g.goal))
        .filter(Boolean) as string[],
      interestNames: scenarioInterestData
        .flatMap((si) => si.interests.flatMap((i) => i.name))
        .filter(Boolean) as string[],
    };
  });
}

/**
 * Calculates match scores and reasons for scenarios based on user preferences
 */
function _calculateMatchScoresAndReasons(
  userPreferences: UserPreferences,
  scenarioLinkages: ScenarioLinkage[]
): RecommendedScenario[] {
  const { goalIds: userGoalIds, interestIds: userInterestIds } =
    userPreferences;

  return scenarioLinkages.map((linkage) => {
    const {
      scenario,
      goalIds: scenarioGoalIds,
      interestIds: scenarioInterestIds,
    } = linkage;

    // Calculate goal matches
    const goalMatches = scenarioGoalIds.filter((goalId) =>
      userGoalIds.includes(goalId)
    );
    const matchedGoalNames = goalMatches
      .map((goalId) => {
        const userGoal = userPreferences.goals.find((g) => g.id === goalId);
        return userGoal?.goal;
      })
      .filter(Boolean) as string[];

    // Calculate interest matches
    const interestMatches = scenarioInterestIds.filter((interestId) =>
      userInterestIds.includes(interestId)
    );
    const matchedInterestNames = interestMatches
      .map((interestId) => {
        const userInterest = userPreferences.interests.find(
          (i) => i.id === interestId
        );
        return userInterest?.name;
      })
      .filter(Boolean) as string[];

    // Calculate match score (0-1)
    const goalScore =
      userGoalIds.length > 0
        ? goalMatches.length /
          Math.max(userGoalIds.length, scenarioGoalIds.length)
        : 0;
    const interestScore =
      userInterestIds.length > 0
        ? interestMatches.length /
          Math.max(userInterestIds.length, scenarioInterestIds.length)
        : 0;

    // Weight goals more heavily than interests
    const matchScore = goalScore * 0.7 + interestScore * 0.3;

    // Build match reasons
    const matchReasons: string[] = [];
    if (matchedGoalNames.length > 0) {
      matchReasons.push(`Matches your goals: ${matchedGoalNames.join(", ")}`);
    }
    if (matchedInterestNames.length > 0) {
      matchReasons.push(
        `Aligns with your interests: ${matchedInterestNames.join(", ")}`
      );
    }
    if (matchReasons.length === 0) {
      matchReasons.push("General recommendation");
    }

    return {
      ...scenario,
      matchScore,
      matchReasons,
    };
  });
}

/**
 * Filters and sorts recommendations based on options
 */
function _filterAndSortRecommendations(
  recommendations: RecommendedScenario[],
  options: RecommendationOptions = {}
): RecommendedScenario[] {
  const { limit = 10, excludeCompletedIds = [], minMatchScore = 0 } = options;

  return recommendations
    .filter((rec) => !excludeCompletedIds.includes(rec.id)) // Exclude completed scenarios
    .filter((rec) => rec.matchScore > minMatchScore) // Only include scenarios with minimum match score
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score descending
    .slice(0, limit); // Limit results
}

/**
 * Main function to get recommended scenarios for a user
 */
export async function getRecommendedScenarios(
  userId: string,
  options: RecommendationOptions = {}
): Promise<RecommendedScenario[]> {
  try {
    // Fetch user preferences
    const userPreferences = await _fetchUserPreferences(userId);

    // If user has no goals or interests, return general recommendations
    if (
      userPreferences.goalIds.length === 0 &&
      userPreferences.interestIds.length === 0
    ) {
      const { data: allScenarios, error } = await supabase
        .from("scenarios")
        .select("*")
        .limit(options.limit || 10);

      if (error) throw error;

      return (allScenarios || []).map((scenario) => ({
        ...scenario,
        matchScore: 0.1,
        matchReasons: ["General recommendation"],
      }));
    }

    // Fetch all scenario linkages
    const scenarioLinkages = await _fetchAllScenarioLinkages();

    // Calculate match scores and reasons
    const recommendations = _calculateMatchScoresAndReasons(
      userPreferences,
      scenarioLinkages
    );

    // Filter and sort recommendations
    return _filterAndSortRecommendations(recommendations, options);
  } catch (error) {
    console.error("Error getting recommended scenarios:", error);
    throw error;
  }
}

/**
 * Get scenarios by specific goal
 */
export async function getScenariosByGoal(goalId: string): Promise<Scenario[]> {
  try {
    const { data, error } = await supabase
      .from("scenario_goals")
      .select("scenarios(*)")
      .eq("goal_id", goalId);

    if (error) throw error;

    return data.flatMap((sg) => sg.scenarios).filter(Boolean) || [];
  } catch (error) {
    console.error("Error getting scenarios by goal:", error);
    throw error;
  }
}

/**
 * Get scenarios by specific interest
 */
export async function getScenariosByInterest(
  interestId: string
): Promise<Scenario[]> {
  try {
    const { data, error } = await supabase
      .from("scenario_interests")
      .select("scenarios(*)")
      .eq("interest_id", interestId);

    if (error) throw error;

    return data?.flatMap((si) => si.scenarios).filter(Boolean) || [];
  } catch (error) {
    console.error("Error getting scenarios by interest:", error);
    throw error;
  }
}

/**
 * Get recommended scenarios with advanced filtering options
 */
export async function getAdvancedRecommendations(
  userId: string,
  options: RecommendationOptions & {
    preferredDifficulty?: string[];
    excludeCategories?: string[];
    boostRecentlyAdded?: boolean;
  } = {}
): Promise<RecommendedScenario[]> {
  // This is a placeholder for future advanced recommendation features
  // For now, it delegates to the main recommendation function
  return getRecommendedScenarios(userId, options);
}
