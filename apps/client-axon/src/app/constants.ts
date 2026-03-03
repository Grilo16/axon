const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing Environment Variable: ${key}. Check your infra/.env file!`,
    );
  }
  return value;
};

export const API_BASE_URL = getEnvVar("VITE_API_URL");
export const AUTH_URL = getEnvVar("VITE_AUTH_URL");
export const REALM = getEnvVar("VITE_AUTH_REALM");
export const KC_CLIENT_ID = getEnvVar("VITE_AUTH_CLIENT_ID");
export const IS_TAURI =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

if (import.meta.env.DEV) {
  console.log("🛠️ Axon Constants Loaded:", { API_BASE_URL, IS_TAURI });
}
