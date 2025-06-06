import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  goals: string[];
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  user_id: string;
  name: string;
  goals?: string[];
  profile_photo_url?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  goals?: string[];
  profile_photo_url?: string;
}

export async function createUser(
  data: CreateUserProfileData
): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return profile;
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUser(
  userId: string,
  updates: UpdateUserProfileData
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
