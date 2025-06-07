import { supabase } from "../lib/supabase";
import type { UserProgress } from "../types";

export async function getProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, this is expected for new users
      throw new Error('No progress found');
    }
    throw error;
  }

  return data;
}

export async function createProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from("user_progress")
    .insert({
      user_id: userId,
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      social_awareness: 0,
      self_advocacy: 0
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}