import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";
import { Flex, Text } from "@shared/ui"; 

interface RequireAuthProps {
  children: React.ReactNode;
}

const AuthLoadingState = () => (
  <Flex $fill $align="center" $justify="center" $bg="bg.main">
    <Text $color="muted" $size="sm" $uppercase $letterSpacing="0.1em">
      Verifying Secure Session...
    </Text>
  </Flex>
);

export const ProtectedRoute: React.FC<RequireAuthProps> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      auth.signinRedirect({ state: location.pathname });
    }
  }, [auth, location.pathname]);

  if (auth.isLoading || auth.activeNavigator) {
    return <AuthLoadingState />;
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};