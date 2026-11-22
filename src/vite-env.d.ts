/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_API_BASE_URL: string;
  readonly VITE_AGENT_API_KEY: string;
  readonly VITE_AGENT_MODEL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Other VITE_* variables can be added here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly location: Location;
  readonly manifest: Manifest;
}