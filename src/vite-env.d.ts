/// <reference types="vite/client" />

// Declaración de variables de entorno usadas en el proyecto
interface ImportMetaEnv {
  readonly VITE_USE_API_CEDULA?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
