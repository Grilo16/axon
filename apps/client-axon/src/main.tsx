import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Provider } from "react-redux";
import App from "./App";
import { persistor, store } from "@app/store";
import { PersistGate } from "redux-persist/integration/react";

// 1. Detect if we are running inside Tauri
const isTauri = "__TAURI_INTERNALS__" in window;

// 2. Configure Keycloak
// NOTE: "Axon" must have a capital A, and client_id must match perfectly!
const oidcConfig = {
  authority: "http://localhost:8080/realms/axon",
  client_id: "axon-client",
  redirect_uri: "http://localhost:5173",
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

// 4. Render the App
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {isTauri ? (
        // 🖥️ Desktop App: Bypass Auth completely!
        <App />
      ) : (
        // 🌐 Web App: Wrap in Keycloak!
        <AuthProvider {...oidcConfig}>
          <WebAuthWrapper>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <App />
              </PersistGate>
            </Provider>
          </WebAuthWrapper>
        </AuthProvider>
      )}
    </Provider>
  </React.StrictMode>,
);
