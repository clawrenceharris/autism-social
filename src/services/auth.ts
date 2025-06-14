import { DatabaseService } from "./database";
import { supabase } from "../lib/supabase";
import type { AuthError, User } from "@supabase/supabase-js";

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }

  return data.user;
}

export async function signUp(
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Get user role by user ID
 * @param userId - The user ID to get role for
 * @returns Promise with role string or null if not found
 */
export async function getUserRole(
  userId: string
): Promise<{ role: string | null; error: Error | null }> {
  try {
    const result = await DatabaseService.getMaybeSingleBy<{ role: string }>(
      "user_roles",
      "user_id",
      userId,
      "role"
    );

    if (result.error) {
      throw result.error;
    }

    return {
      role: result.data?.role || null,
      error: null,
    };
  } catch (error) {
    return {
      role: null,
      error: error as Error,
    };
  }
}
