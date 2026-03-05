import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { store, persistor } from "../store/store";
import { AxonThemeProvider } from "./axon-theme-provider";
import { TauriAuthProvider } from "./tauri-auth-provider";
import { KeycloakAuthProvider } from "./keycloak-auth-provider";
import { IS_TAURI } from "../constants";
import { ToastProvider } from "./toast-provider";
import { TourProvider } from "./tour-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const AuthWrapper = IS_TAURI ? TauriAuthProvider : KeycloakAuthProvider;

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AuthWrapper>
            <AxonThemeProvider>
              <TourProvider>
                {children}
                <ToastProvider />
              </TourProvider>
            </AxonThemeProvider>
          </AuthWrapper>
        </BrowserRouter>
      </PersistGate>
    </ReduxProvider>
  );
};
