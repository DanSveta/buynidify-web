/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Anthropic API key for the built-in AI property analysis. Set once for
   *  the whole deployment (never per-user) - see .env.example. */
  readonly VITE_ANTHROPIC_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
