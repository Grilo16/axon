import { useTour } from "@app/providers";
import { WorkspaceLoader } from "@features/core/workspace";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { WorkspaceSidebar } from "../sidebar";
import { AXON_TOUR_STEPS } from "@features/core/tour";
import { useActiveWorkspaceId, useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useAllWorkspacesQuery } from "@features/core/workspace/hooks/use-workspace-queries";

export const PrivateSidebar = () => {
    const [isLoaderOpen, setIsLoaderOpen] = useState(false);
    const activeWorkspaceId = useActiveWorkspaceId()
    const {switchWorkspace} = useWorkspaceDispatchers()
    const {workspaces} = useAllWorkspacesQuery()
  
  // 2. Third-party integrations
  const auth = useAuth();
  const { startTour } = useTour();

  const handleLogout = () => {
    auth.signoutRedirect();
  };

  return (
    <>
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={switchWorkspace}
        onCreateClick={() => setIsLoaderOpen(true)}
        onTourClick={() => startTour(AXON_TOUR_STEPS)}
        onLogoutClick={handleLogout}
      />

      {/* Modals are managed locally by the smart container */}
      {isLoaderOpen && (
        <WorkspaceLoader onClose={() => setIsLoaderOpen(false)} />
      )}
    </>
  );
};