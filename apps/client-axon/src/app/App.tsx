import { MobileBouncer } from "@shared/ui/components/mobile-bouncer";
import { AppProviders } from "./providers/app-providers";
import { AppRoutes } from "./routes/app-routes";

export const App = () => {
  return (
    <AppProviders>
      <MobileBouncer>
        <AppRoutes />
      </MobileBouncer>
    </AppProviders>
  );
};
