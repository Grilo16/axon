import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { useAppSelector } from "./app/hooks";
import { selectCurrentTheme } from "@features/theme/themeSlice";
import { GlobalStyles } from "@theme/GlobalStyles";
import { AppRoutes } from "./app/AppRoutes";
import { ToastProvider } from "@components/ui/Toast";

function App() {
  const theme = useAppSelector(selectCurrentTheme);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
