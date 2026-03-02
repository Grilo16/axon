import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AxonThemeProvider } from "@features/core/theme";
import { AppRoutes } from "@app/AppRoutes";

function App() {
  return (
    <AxonThemeProvider>
      <BrowserRouter>
        <AppRoutes />
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
