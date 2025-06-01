import { supabase } from "../lib/supabase";
import type { Scenario } from "../types";

export async function insertScenario({ scenario }: { scenario: Scenario }) {
  // Step 1: Insert the scenario
  const { data, error: scenarioError } = await supabase
    .from("scenarios")
    .insert([{ title: scenario.title, description: scenario.description }])
    .select()
    .single();

  if (scenarioError) throw new Error(scenarioError.message);

  // Step 2: Insert the variation with steps
  const { error: variationError } = await supabase.from("variations").insert([
    {
      scenario_id: data.id,
      title: scenario.variationTitle,
      persona_tags: scenario.personaTags,
      user_fields: scenario.userFields,
      steps: scenario.steps,
      scoring_categories: scenario.scoringCategories,
    },
  ]);

  if (variationError) throw new Error(variationError.message);

  return { success: true };
}
