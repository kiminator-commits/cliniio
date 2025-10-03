/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;

  // AI Service Configuration
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_GOOGLE_VISION_API_KEY: string;
  readonly VITE_AZURE_VISION_API_KEY: string;
  readonly VITE_AZURE_VISION_ENDPOINT: string;

  // Application Configuration
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_API_BASE_URL: string; // Required - no fallback to localhost
  readonly VITE_ENV_CLEAN_WS_URL: string;

  // Feature Flags
  readonly VITE_ENABLE_AI_FEATURES: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;

  // Environment Detection
  readonly NODE_ENV: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
