/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // הוסף כאן משתני סביבה נוספים
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 