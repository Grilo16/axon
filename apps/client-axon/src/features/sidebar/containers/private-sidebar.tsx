import { VscAdd } from "react-icons/vsc";
import { HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "react-oidc-context";

import { useTour } from "@app/providers";
import { AXON_TOUR_STEPS } from "@features/core/tour";
import { WorkspaceLoader } from "@features/core/workspace";
import { useActiveWorkspaceId, useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useAllWorkspacesQuery } from "@features/core/workspace/hooks/use-workspace-queries";
import { WorkspaceSidebar } from "../sidebar";
import { SidebarIcon } from "../sidebar-icon";

export const PrivateSidebar = () => {
    const [isLoaderOpen, setIsLoaderOpen] = useState(false);
    const activeWorkspaceId = useActiveWorkspaceId();
    const { switchWorkspace } = useWorkspaceDispatchers();
    const { workspaces } = useAllWorkspacesQuery();
    
    const auth = useAuth();
    const { startTour } = useTour();

    const PrivateActions = (
      <>
        <SidebarIcon title="Create New Workspace" onClick={() => setIsLoaderOpen(true)} icon={<VscAdd size={18} />} />
        <SidebarIcon title="Take a Tour" onClick={() => startTour(AXON_TOUR_STEPS)} icon={<HelpCircle size={16} />} />
        <SidebarIcon title="Log Out" $isDanger onClick={() => auth.signoutRedirect({
          post_logout_redirect_uri: window.location.origin
        })} icon={<LogOut size={16} />} />
      </>
    );

  return (
    <>
      <WorkspaceSidebar
        workspaces={workspaces || []}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={switchWorkspace}
        bottomActions={PrivateActions}
      />
      {isLoaderOpen && <WorkspaceLoader onClose={() => setIsLoaderOpen(false)} />}
    </>
  );
};