import { supabase } from "../lib/supabase";
import type { RecommendedDialogue } from "../types";

export async function getRecommendedDialogues(
  userId: string
): Promise<RecommendedDialogue[]> {
  const { data, error } = await supabase.rpc("get_recommended_dialogues", {
    user_uuid: userId,
  });

  if (error) throw error;
  return data as RecommendedDialogue[];
}
