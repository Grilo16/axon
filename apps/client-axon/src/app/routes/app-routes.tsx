import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@features/sidebar";
import { WorkspacePage } from "@pages/workspace-page/workspace-page";
import { ProtectedRoute } from "./protected-route";
import { AxonLayoutShell } from "../shell/axon-layout-shell";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AxonLayoutShell sidebar={<Sidebar />} />}>
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