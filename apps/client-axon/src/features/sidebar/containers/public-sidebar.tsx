import { LogIn, Github } from "lucide-react";
import { useAuth } from "react-oidc-context";

import { useActiveWorkspaceId, useWorkspaceDispatchers } from "@features/core/workspace/hooks/use-workspace-slice";
import { useListPublicWorkspacesQuery } from "@features/public/api/public-api";
import { WorkspaceSidebar } from "../sidebar";
import { SidebarIcon } from "../sidebar-icon";

export const PublicSidebar = () => {
    const activeWorkspaceId = useActiveWorkspaceId();
    const { switchWorkspace } = useWorkspaceDispatchers();
    
    const { data: publicWorkspaces = [] } = useListPublicWorkspacesQuery();
    
    const auth = useAuth();

    // 🌟 Group the public actions (PLG Conversion points!)
    const PublicActions = (
      <>
        <SidebarIcon 
          title="View on GitHub" 
          onClick={() => window.open("https://github.com/your-repo/axon", "_blank")} 
          icon={<Github size={16} />} 
        />
        <SidebarIcon 
          title="Sign In / Register" 
          onClick={() => auth.signinRedirect()} 
          icon={<LogIn size={16} />} 
          style={{ color: '#3b82f6' }} 
        />
      </>
    );

  return (
    <WorkspaceSidebar
      workspaces={publicWorkspaces}
      activeWorkspaceId={activeWorkspaceId}
      onSelectWorkspace={switchWorkspace}
      bottomActions={PublicActions}
    />
  );
};