import { Routes, Route } from "react-router-dom";
import { WorkspacePage } from "@pages/workspace-page/workspace-page";
import { ProtectedRoute } from "./protected-route";
import { AxonLayoutShell } from "../shell/axon-layout-shell";
import PublicSandboxPage from "@pages/public-page/public-page";
import { PrivateSidebar } from "@features/sidebar/containers/private-sidebar";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AxonLayoutShell sidebar={<PrivateSidebar />} />}>
        <Route 
          path="/public" 
          element={
              <PublicSandboxPage />
          } 
        />
        <Route 
          path="/" 
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