/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  // Add other VITE_ env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
