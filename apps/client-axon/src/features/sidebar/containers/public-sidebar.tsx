import { LogIn, HelpCircle, Sparkles } from "lucide-react";
import { useAuth } from "react-oidc-context";

import {
  useActiveWorkspaceId,
  useWorkspaceDispatchers,
} from "@features/core/workspace/hooks/use-workspace-slice";
import { useListPublicWorkspacesQuery } from "@features/public/api/public-api";
import { WorkspaceSidebar } from "../sidebar";
import { SidebarIcon } from "../sidebar-icon";
import { useTour } from "@app/providers";
import { useState } from "react";
import { RequestAccessModal } from "../request-access-modal";

export const PublicSidebar = () => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const activeWorkspaceId = useActiveWorkspaceId();
  const { switchWorkspace } = useWorkspaceDispatchers();

  const { data: publicWorkspaces = [] } = useListPublicWorkspacesQuery();

  const auth = useAuth();
  const { startTour } = useTour();

  const PublicActions = (
    <>
      <SidebarIcon
        title="Take a Tour"
        onClick={() => startTour()}
        icon={<HelpCircle size={16} />}
      />
        <SidebarIcon
          title="Request Early Access"
          onClick={() => setIsRequestModalOpen(true)}
          icon={<Sparkles size={16} />}
          style={{ color: "#22c55e" }}
          $aura={true}
        />

      <SidebarIcon
        title="Sign In / Register"
        onClick={() => auth.signinRedirect()}
        icon={<LogIn size={16} />}
        style={{ color: "#3b82f6" }}
      />
    </>
  );

  return (
    <>
      <WorkspaceSidebar
        workspaces={publicWorkspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={switchWorkspace}
        bottomActions={PublicActions}
      />
      <RequestAccessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </>
  );
};
