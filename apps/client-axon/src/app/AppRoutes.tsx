import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@features/sidebar";
import { MainLayout } from "@shared/ui/layout";
import { WorkspacePage } from "@pages/workspace-page/workspace-page";
import { ProtectedRoute } from "./auth/protected-route";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout sidebar={<Sidebar />} />}>
      <Route path="/" element={
        <ProtectedRoute>
          <WorkspacePage/>
        </ProtectedRoute>
      }/>
      </Route>
    </Routes>
  );
};
