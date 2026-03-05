import { AppProviders } from "./providers/app-providers";
import { AppRoutes } from "./routes/app-routes";

export const App = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};