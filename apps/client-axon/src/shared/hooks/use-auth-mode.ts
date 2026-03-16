import { useAuth } from "react-oidc-context";

/**
 * Thin wrapper around `useAuth` that exposes only the boolean.
 * Avoids importing the full OIDC context in every switchboard hook.
 */
export const useIsAuthenticated = () => useAuth().isAuthenticated;
