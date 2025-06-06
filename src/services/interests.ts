import { supabase } from "../lib/supabase";

export interface Interest {
  id: string;
  name: string;
}

export async function getInterests(): Promise<Interest[]> {
  const { data, error } = await supabase
    .from('interests')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function addUserInterests(userId: string, interestIds: string[]): Promise<void> {
  const userInterests = interestIds.map(interestId => ({
    user_id: userId,
    interest_id: interestId
  }));

  const { error } = await supabase
    .from('user_interests')
    .insert(userInterests);

  if (error) throw error;
}