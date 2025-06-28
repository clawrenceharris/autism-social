import { supabase } from "../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export type Table =
  | "scenarios"
  | "dialogues"
  | "goals"
  | "user_progress"
  | "interests"
  | "user_interests"
  | "user_goals"
  | "user_profiles"
  | "user_roles"
  | "dialogue_goals"
  | "dialogue_interests"
  | "actors"
  | "daily_challenges"
  | "scoring_categories"
  | "dialogue_scoring_events"
  | "user_streaks";

export interface DatabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryOptions {
  column?: string;
  value?: string | number;
  foreignKey?: string;
  foreignValue?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  select?: string;
}

export class DatabaseService {
  /**
   * Create a new record in the specified table
   * @param table - The table name
   * @param data - The data to insert
   * @returns Promise with the created record or error
   */
  static async create<T extends object>(
    table: Table,
    data: T
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();
    return { data: result as T, error };
  }

  /**
   * Get multiple records from a table with optional filtering and ordering
   * @param table - The table name
   * @param query - Query options for filtering, ordering, etc.
   * @returns Promise with array of records or error
   */
  static async get<T>(
    table: Table,
    query?: QueryOptions
  ): Promise<DatabaseResult<T[]>> {
    let queryBuilder = supabase.from(table).select(query?.select || "*");

    if (query?.column && query?.value !== undefined) {
      queryBuilder = queryBuilder.eq(query.column, query.value);
    }

    if (query?.foreignKey && query?.foreignValue) {
      queryBuilder = queryBuilder.eq(query.foreignKey, query.foreignValue);
    }

    if (query?.orderBy) {
      queryBuilder = queryBuilder.order(query.orderBy, {
        ascending: query.ascending ?? true,
      });
    }

    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    const { data, error } = await queryBuilder;
    return { data: data as T[], error };
  }

  /**
   * Get a single record by ID
   * @param table - The table name
   * @param id - The record ID
   * @param select - Optional select clause
   * @returns Promise with single record or error
   */
  static async getSingle<T>(
    table: Table,
    id: string,
    select?: string
  ): Promise<DatabaseResult<T>> {
    const { data, error } = await supabase
      .from(table)
      .select(select || "*")
      .eq("id", id)
      .single();

    return { data: data as T, error };
  }

  /**
   * Get a single record by custom column
   * @param table - The table name
   * @param column - The column to filter by
   * @param value - The value to match
   * @param select - Optional select clause
   * @returns Promise with single record or error
   */
  static async getSingleBy<T>(
    table: Table,
    column: string,
    value: string | number,
    select?: string
  ): Promise<DatabaseResult<T>> {
    const { data, error } = await supabase
      .from(table)
      .select(select || "*")
      .eq(column, value)
      .single();

    return { data: data as T, error };
  }

  /**
   * Get a single record by custom column (may return null if not found)
   * @param table - The table name
   * @param column - The column to filter by
   * @param value - The value to match
   * @param select - Optional select clause
   * @returns Promise with single record, null, or error
   */
  static async getMaybeSingleBy<T>(
    table: Table,
    column: string,
    value: string | number,
    select?: string
  ): Promise<DatabaseResult<T>> {
    const { data, error } = await supabase
      .from(table)
      .select(select || "*")
      .eq(column, value)
      .maybeSingle();

    return { data: data as T, error };
  }

  /**
   * Update a record by ID
   * @param table - The table name
   * @param id - The record ID
   * @param data - The data to update
   * @returns Promise with updated record or error
   */
  static async update<T extends object>(
    table: Table,
    id: string,
    data: Partial<T>
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    return { data: result as T, error };
  }

  /**
   * Upsert a record
   * @param table - The table name
   * @param id - The record ID if given
   * @param data - The data to upsert
   * @returns Promise with upserted record or error
   */
  static async upsert<T>(
    table: Table,

    data: Partial<T>,
    onConflict: string
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .upsert(data, { onConflict })
      .select()
      .single();

    return { data: result as T, error };
  }

  /**
   * Update records by custom column
   * @param table - The table name
   * @param column - The column to filter by
   * @param value - The value to match
   * @param data - The data to update
   * @returns Promise with updated records or error
   */
  static async updateBy<T extends object>(
    table: Table,
    column: string,
    value: string | number,
    data: Partial<T>
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq(column, value)
      .select()
      .single();

    return { data: result as T, error };
  }

  /**
   * Delete a record by ID
   * @param table - The table name
   * @param id - The record ID
   * @returns Promise with error if any
   */
  static async delete(
    table: Table,
    id: string
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.from(table).delete().eq("id", id);
    return { error };
  }

  /**
   * Delete records by custom column
   * @param table - The table name
   * @param column - The column to filter by
   * @param value - The value to match
   * @returns Promise with error if any
   */
  static async deleteBy(
    table: Table,
    column: string,
    value: string | number
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.from(table).delete().eq(column, value);
    return { error };
  }

  /**
   * Delete multiple records by array of values
   * @param table - The table name
   * @param column - The column to filter by
   * @param values - Array of values to match
   * @returns Promise with error if any
   */
  static async deleteIn(
    table: Table,
    column: string,
    values: (string | number)[]
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.from(table).delete().in(column, values);
    return { error };
  }

  /**
   * Insert multiple records
   * @param table - The table name
   * @param data - Array of records to insert
   * @returns Promise with inserted records or error
   */
  static async insertMany<T extends object>(
    table: Table,
    data: T[]
  ): Promise<DatabaseResult<T[]>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    return { data: result as T[], error };
  }

  /**
   * Get records with complex joins and filtering
   * @param table - The table name
   * @param select - Select clause with joins
   * @param filters - Object with column-value pairs for filtering
   * @returns Promise with records or error
   */
  static async getWithJoins<T>(
    table: Table,
    select: string,
    filters?: Record<string, unknown>
  ): Promise<DatabaseResult<T[]>> {
    let queryBuilder = supabase.from(table).select(select);

    if (filters) {
      Object.entries(filters).forEach(([column, value]) => {
        if (Array.isArray(value)) {
          queryBuilder = queryBuilder.in(column, value);
        } else {
          queryBuilder = queryBuilder.eq(column, value);
        }
      });
    }

    const { data, error } = await queryBuilder;
    return { data: data as T[], error };
  }

  /**
   * Check if a record exists
   * @param table - The table name
   * @param column - The column to check
   * @param value - The value to match
   * @returns Promise with boolean result or error
   */
  static async exists(
    table: Table,
    column: string,
    value: string | number
  ): Promise<{ exists: boolean; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq(column, value)
      .limit(1);

    return {
      exists: !error && data && data.length > 0,
      error,
    };
  }

  /**
   * Count records with optional filtering
   * @param table - The table name
   * @param filters - Optional filters
   * @returns Promise with count or error
   */
  static async count(
    table: Table,
    filters?: Record<string, unknown>
  ): Promise<{ count: number; error: PostgrestError | null }> {
    let queryBuilder = supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (filters) {
      Object.entries(filters).forEach(([column, value]) => {
        queryBuilder = queryBuilder.eq(column, value);
      });
    }

    const { count, error } = await queryBuilder;
    return { count: count || 0, error };
  }
}
