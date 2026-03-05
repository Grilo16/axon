import React, { useState } from "react";
import { VscAdd } from "react-icons/vsc";
import { HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "react-oidc-context";

import { useTour } from "@app/providers/tour-provider";
import { WorkspaceLoader } from "@features/core/workspace";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { AXON_TOUR_STEPS } from "@features/core/tour/tour-steps";

import { Flex, Box, Text } from "@shared/ui";
import { SidebarIcon } from "./components/sidebar-icon";
import { LibraryHubModal } from "./components/library-hub-modal";

/**
 * Extracts a 2-letter abbreviation for the workspace icon.
 * e.g., "Alpha Project" -> "AP", "axon-core" -> "AC"
 */
function getInitials(name: string): string {
  const clean = (name ?? "").trim();
  if (!clean) return "WS";
  
  const parts = clean.split(/[\s\-_./]+/).filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const Sidebar = () => {
  const { workspaces, activeWorkspace, open } = useWorkspaceManager();
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const auth = useAuth();
  const { startTour } = useTour();

  const handleOpenWorkspace = (id: string) => (_e: React.MouseEvent<HTMLButtonElement>) => {
    open(id);
  };

  const handleLogout = () => {
    auth.signoutRedirect();
  };

  return (
    <>
      <Flex
        id="tour-sidebar-workspaces"
        $direction="column"
        $align="center"
        $gap="md" 
        $fill
      >
        {workspaces.map((ws) => (
          <SidebarIcon
            key={ws.id}
            icon={<Text $size="lg" $weight="bold">{getInitials(ws.name)}</Text>}
            title={ws.name}
            $active={ws.id === activeWorkspace?.id}
            onClick={handleOpenWorkspace(ws.id)}
          />
        ))}

        {/* Subtle Divider */}
        <Box
          $bg="border.subtle"
          style={{ width: 32, height: 2, borderRadius: 1 }}
        />

        <SidebarIcon
          title="Create New Workspace"
          $active={isLoaderOpen}
          onClick={() => setIsLoaderOpen(true)}
          icon={<VscAdd size={18} />}
        />

        <Box $fill />

        <SidebarIcon
          title="Take a Tour"
          onClick={() => startTour(AXON_TOUR_STEPS)}
          icon={<HelpCircle size={16} />}
        />

        <SidebarIcon
          title="Log Out"
          $isDanger
          onClick={handleLogout}
          icon={<LogOut size={16} />}
        />
      </Flex>

      {/* Modals */}
      {isLoaderOpen && (
        <WorkspaceLoader onClose={() => setIsLoaderOpen(false)} />
      )}
      {isHubOpen && (
        <LibraryHubModal onClose={() => setIsHubOpen(false)} />
      )}
    </>
  );
};