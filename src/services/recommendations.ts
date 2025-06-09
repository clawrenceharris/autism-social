import { supabase } from "../lib/supabase";
import type { Dialogue } from "../types";

export async function getRecommendedDialogues(
  userId: string
): Promise<Dialogue[]> {
  const { data, error } = await supabase.rpc("get_recommended_dialogues", {
    user_uuid: userId,
  });
  console.log({ data });
  if (error) throw error;
  return data as Dialogue[];
}
