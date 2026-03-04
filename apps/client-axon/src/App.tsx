import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AxonThemeProvider } from "@features/core/theme";
import { AppRoutes } from "@app/AppRoutes";
import { KeycloakAuthProvider } from "@app/auth/keycloak-auth-provider";
import { IS_TAURI } from "@app/constants";
import { TauriAuthProvider } from "@app/auth/tauri-auth-provider";

function App() {
  const AuthWrapper = IS_TAURI ? TauriAuthProvider : KeycloakAuthProvider;
  return (
    <AxonThemeProvider>
      <BrowserRouter>
        <AuthWrapper>
          <AppRoutes />
        </AuthWrapper>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#1e1e1e",
            border: "1px solid #333",
            color: "#fff",
          },
        }}
      />
    </AxonThemeProvider>
  );
}

export default App;
