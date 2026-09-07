/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '@ios27_design_system/tokens/css'
declare module '@ios27_design_system/tokens/css/materials'
declare module '@ios27_design_system/tokens/css/typography'

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
