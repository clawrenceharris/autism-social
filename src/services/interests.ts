import { supabase } from "../lib/supabase";
import type { Interest } from "../types";

export async function getInterests(): Promise<Interest[]> {
  const { data, error } = await supabase
    .from("interests")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function addUserInterests(
  userId: string,
  interestIds: string[]
): Promise<void> {
  // First, get the user's existing interests to avoid duplicates
  const { data: existingInterests, error: fetchError } = await supabase
    .from("user_interests")
    .select("interest_id")
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  // Filter out interests that the user already has
  const existingInterestIds = existingInterests?.map(ui => ui.interest_id) || [];
  const newInterestIds = interestIds.filter(interestId => !existingInterestIds.includes(interestId));

  // Only insert if there are new interests to add
  if (newInterestIds.length > 0) {
    const userInterests = newInterestIds.map((interestId) => ({
      user_id: userId,
      interest_id: interestId,
    }));

    const { error } = await supabase.from("user_interests").insert(userInterests);

    if (error) throw error;
  }
}