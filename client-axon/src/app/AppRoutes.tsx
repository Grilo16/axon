import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { WelcomePage } from "@pages/WelcomePage";
import { WorkspacePage } from "@pages/WorkspacePage";
import { LibraryHubPage } from "@pages/LibraryHubPage";
import { useLibrary } from "@features/workspace/useLibrary";
import { Sidebar } from "@components/Sidebar/Sidebar";

export const AppRoutes = () => {
  const { activeId } = useLibrary();

  return (
    <Routes>
      <Route element={<MainLayout sidebar={<Sidebar />} />}>
        <Route path="/" element={activeId ? <Navigate to="/workspace" /> : <WelcomePage />} />
        <Route path="/workspace" element={activeId ? <WorkspacePage /> : <Navigate to="/" />} />

        <Route path="/hub" element={<LibraryHubPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};
