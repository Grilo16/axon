import React from "react";
import { AuthProvider } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { User } from "oidc-client-ts";
import { oidcConfig } from "./oidc-config";
import { GlobalAuthListener } from "./global-auth-listener";

interface KeycloakAuthProviderProps {
  children: React.ReactNode;
}

export const KeycloakAuthProvider: React.FC<KeycloakAuthProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();

  const onSigninCallback = (user: User | void) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    const targetUrl = typeof user?.state === "string" ? user.state : "/";
    navigate(targetUrl, { replace: true });
  };

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <GlobalAuthListener />
      {children}
    </AuthProvider>
  );
};
