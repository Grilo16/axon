import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "@app/store";
// persistor, 
// import { PersistGate } from "redux-persist/integration/react";

// 1. Detect if we are running inside Tauri
const isTauri = "__TAURI_INTERNALS__" in window;

// 2. Configure Keycloak
const oidcConfig = {
  authority: "https://auth.tom-britton.com/realms/axon",
  client_id: "axon-client",
  // This MUST match the domain you are visiting
  redirect_uri: window.location.origin, 
  scope: "openid profile email",
};
// 3. Create a Guard Component for Web Users
const WebAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing in silently...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading auth...
      </div>
    );
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect()
  }

  // If authenticated, render the app!
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        {isTauri ? (
          <App />
        ) : (
          <AuthProvider {...oidcConfig}>
            <WebAuthWrapper>
              <App />
            </WebAuthWrapper>
          </AuthProvider>
        )}
      {/* </PersistGate> */}
    </Provider>
  </React.StrictMode>
);