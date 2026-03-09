import { Routes, Route } from "react-router-dom";
import { WorkspacePage } from "@pages/workspace-page/workspace-page";
import { ProtectedRoute } from "./protected-route";
import { AxonLayoutShell } from "../shell/axon-layout-shell";
import PublicSandboxPage from "@pages/public-page/public-page";
import { PrivateSidebar } from "@features/sidebar/containers/private-sidebar";
import { PublicSidebar } from "@features/sidebar/containers/public-sidebar";
import { IS_TAURI, IS_WEB } from "@app/constants";

export const AppRoutes = () => {
  return (
    <Routes>
      {IS_WEB && (
        <Route element={<AxonLayoutShell sidebar={<PublicSidebar />} />}>
          <Route path="/" element={<PublicSandboxPage />} />
        </Route>
      )}
      <Route element={<AxonLayoutShell sidebar={<PrivateSidebar />} />}>
        <Route
          path={IS_TAURI ? "/" : "/app"}
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
