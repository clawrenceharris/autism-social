import { supabase } from '../lib/supabase';

export interface CreateScenarioData {
  title: string;
  description: string;
}

export interface CreateDialogueData {
  scenarioId: string;
  title: string;
  personaTags: string[];
  userFields: string[];
  steps: any[];
  scoringCategories: string[];
}

export async function createScenario({ title, description }: CreateScenarioData) {
  const { data, error } = await supabase
    .from('scenarios')
    .insert([{ title, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createDialogue(data: CreateDialogueData) {
  const { error } = await supabase
    .from('dialogues')
    .insert([{
      scenario_id: data.scenarioId,
      title: data.title,
      persona_tags: data.personaTags,
      user_fields: data.userFields,
      steps: data.steps,
      scoring_categories: data.scoringCategories,
    }]);

  if (error) throw error;
  return true;
}