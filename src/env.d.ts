// src/env.d.ts
/// <reference types="vite/client" />

// Поддержка импорта .vue файлов в TypeScript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Глобальные переменные окружения (опционально, для автодополнения)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  // добавь свои переменные, если будут
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}