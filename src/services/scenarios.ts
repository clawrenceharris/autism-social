import { supabase } from '../lib/supabase';

export interface CreateScenarioData {
  title: string;
  description: string;
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