import { DatabaseService } from "./database";
import { supabase } from "../lib/supabase";
import type { Interest } from "../types";

/**
 * Get all available interests
 * @returns Promise with array of interests
 * @throws Error if database query fails
 */
export async function getInterests(): Promise<Interest[]> {
  const result = await DatabaseService.get<Interest>("interests", {
    orderBy: "name",
    ascending: true,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data || [];
}

/**
 * Update user interests (replace existing with new ones)
 * @param userId - The user ID
 * @param interestIds - Array of interest IDs to set
 * @throws Error if operation fails
 */
export async function updateUserInterests(
  userId: string,
  interestIds: string[]
): Promise<Interest[]> {
  const { data, error } = await supabase.rpc('update_user_interests', {
    user_uuid: userId,
    new_interest_ids: interestIds
  });

  if (error) {
    throw error;
  }

  // Transform the RPC result to Interest objects
  const interests: Interest[] = (data || []).map((item: any) => ({
    id: item.interest_id,
    name: item.interest_name,
    created_at: item.created_at
  }));

  return interests;
}