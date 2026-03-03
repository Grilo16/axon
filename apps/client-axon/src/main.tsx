import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Provider } from "react-redux";
import App from "./App";
import { persistor, store } from "@app/store";
import { PersistGate } from "redux-persist/integration/react";
import { AUTH_URL, IS_TAURI, KC_CLIENT_ID, REALM } from "@app/constants";

const oidcConfig = {
  authority: `${AUTH_URL}/realms/${REALM}`,
  client_id: KC_CLIENT_ID,
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
      <PersistGate loading={null} persistor={persistor}>
        {IS_TAURI ? (
          <App />
        ) : (
          <AuthProvider {...oidcConfig}>
            <WebAuthWrapper>
              <App />
            </WebAuthWrapper>
          </AuthProvider>
        )}
      </PersistGate>
    </Provider>
  </React.StrictMode>
);