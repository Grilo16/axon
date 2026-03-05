const requireEnv = (value: string | undefined, name: string): string => {
if (value) return value;
  if (typeof window === 'undefined') {
    return "";
  }

  throw new Error(`❌ Missing Environment Variable: ${name}.`);
};

export const API_BASE_URL = requireEnv(import.meta.env.VITE_API_URL, "VITE_API_URL");
export const AUTH_URL = requireEnv(import.meta.env.VITE_AUTH_URL, "VITE_AUTH_URL");
export const REALM = requireEnv(import.meta.env.VITE_AUTH_REALM, "VITE_AUTH_REALM");
export const KC_CLIENT_ID = requireEnv(import.meta.env.VITE_AUTH_CLIENT_ID, "VITE_AUTH_CLIENT_ID");
export const APP_ENV = requireEnv(import.meta.env.VITE_APP_ENV, "VITE_APP_ENV");

export const IS_TAURI = APP_ENV === 'tauri';
export const IS_WEB = APP_ENV === 'web';

if (import.meta.env.DEV) {
  console.log("🛠️ Axon Constants Loaded:", { API_BASE_URL, IS_TAURI });
}