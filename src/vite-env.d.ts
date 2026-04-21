/// <reference types="vite/client" />

// Declaración de variables de entorno usadas en el proyecto
interface ImportMetaEnv {
  readonly VITE_CEDULA_API_USER?: string;
  readonly VITE_CEDULA_API_PASSWORD?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
