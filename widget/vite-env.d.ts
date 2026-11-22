/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_AGENT_API_BASE_URL: string;
  readonly VITE_AGENT_API_KEY: string;
  readonly VITE_AGENT_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
