import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export type Table = 'scenarios' | 'dialogues';

export interface DatabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export class DatabaseService {
  static async create<T extends object>(
    table: Table,
    data: T,
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    return { data: result as T, error };
  }

  static async get<T>(
    table: Table,
    query?: {
      column?: string;
      value?: string | number;
      foreignKey?: string;
      foreignValue?: string;
    }
  ): Promise<DatabaseResult<T[]>> {
    let queryBuilder = supabase.from(table).select('*');

    if (query?.column && query?.value) {
      queryBuilder = queryBuilder.eq(query.column, query.value);
    }

    if (query?.foreignKey && query?.foreignValue) {
      queryBuilder = queryBuilder.eq(query.foreignKey, query.foreignValue);
    }

    const { data, error } = await queryBuilder;
    return { data: data as T[], error };
  }

  static async update<T extends object>(
    table: Table,
    id: string,
    data: Partial<T>
  ): Promise<DatabaseResult<T>> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: result as T, error };
  }

  static async delete(
    table: Table,
    id: string
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    return { error };
  }
}