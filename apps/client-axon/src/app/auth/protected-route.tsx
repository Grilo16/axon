import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; 
}

export const ProtectedRoute: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback = <div>Loading secure session...</div> 
}) => {
  const auth = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      auth.signinRedirect({ state: location.pathname });
    }
  }, [auth, location.pathname]);

  if (auth.isLoading || auth.activeNavigator) {
    return <>{fallback}</>;
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};