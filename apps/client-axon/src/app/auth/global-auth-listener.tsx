// src/auth/GlobalAuthListener.tsx
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export const GlobalAuthListener = () => {
  const auth = useAuth();

  useEffect(() => {
    const executeLogout = async (reason: string) => {
      console.warn(`[Axon Auth] Session terminated: ${reason}. Redirecting...`);
      await auth.removeUser(); 
      auth.signinRedirect({ state: window.location.pathname });
    };

    const handleApiUnauthorized = () => executeLogout("Rust API 401 Unauthorized");
    window.addEventListener("auth:unauthorized", handleApiUnauthorized);

    const handleSilentRenewError = (error: Error) => {
      executeLogout(`Silent renew failed (${error.message})`);
    };
    
    const handleUserSignedOut = () => executeLogout("Keycloak user signed out");

    auth.events.addSilentRenewError(handleSilentRenewError);
    auth.events.addUserSignedOut(handleUserSignedOut);

    return () => {
      window.removeEventListener("auth:unauthorized", handleApiUnauthorized);
      auth.events.removeSilentRenewError(handleSilentRenewError);
      auth.events.removeUserSignedOut(handleUserSignedOut);
    };
  }, [auth]);

  return null; 
};