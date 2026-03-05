import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useBundleSession } from "@features/core/bundles/hooks/use-bundle-session";
import { ModalOverlay, ModalCard, ModalBody } from "@shared/ui";

import { LibraryHubHeader } from "./library-hub-header";
import { WorkspaceHubGrid } from "./workspace-hub-grid";

interface LibraryHubModalProps {
  onClose: () => void;
}

export const LibraryHubModal = ({ onClose }: LibraryHubModalProps) => {
  // 1. Fetch Data
  const { workspaces, activeWorkspace, open } = useWorkspaceManager();
  const { allBundles } = useBundleSession();

  // 2. Handle Actions
  const handleWorkspaceSelect = (id: string) => {
    open(id);
    onClose();
  };

  // 3. Orchestrate UI
  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard $width="800px" onClick={(e) => e.stopPropagation()}>
        
        <LibraryHubHeader onClose={onClose} />
        
        <ModalBody>
          <WorkspaceHubGrid 
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspace?.id}
            allBundles={allBundles}
            onSelectWorkspace={handleWorkspaceSelect}
          />
        </ModalBody>

      </ModalCard>
    </ModalOverlay>
  );
};