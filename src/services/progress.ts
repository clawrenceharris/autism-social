import { DatabaseService } from "./database";
import type { UserProgress } from "../types";

export async function getProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await DatabaseService.getSingle<UserProgress>(
    "user_progress",
    userId
  );

  if (error) throw error;

  return data;
}

export async function createProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await DatabaseService.create<UserProgress>(
    "user_progress",
    {
      user_id: userId,
      clarity: 0,
      empathy: 0,
      assertiveness: 0,
      social_awareness: 0,
      self_advocacy: 0
          
      
    }
  );

  if (error) throw error;

  return data;
}
