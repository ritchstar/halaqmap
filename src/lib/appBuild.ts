/** Injected at compile time via Vite `define` (see vite.config.ts). */
export const APP_BUILD = {
  version: __APP_PKG_VERSION__,
  commit: __APP_GIT_COMMIT__,
  builtAtIso: __APP_BUILD_TIME_ISO__,
} as const;
