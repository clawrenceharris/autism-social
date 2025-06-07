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
