import { createClient } from "@supabase/supabase-js";
import { PostgrestClient } from '@supabase/postgrest-js'

export const supabase = createClient(
  ,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
