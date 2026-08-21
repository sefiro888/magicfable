/// <reference types="vite/client" />

/** Configuración del backend de multijugador (ver src/multiplayer/supabaseClient.ts). */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
