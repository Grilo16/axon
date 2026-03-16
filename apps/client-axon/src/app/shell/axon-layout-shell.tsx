import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { AppMain, AppShell, AppSidebar } from "@shared/ui";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";

const MobileTopBar = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
  height: 48px;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.bg.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const MobileShell = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.bg.main};
`;

export const AxonLayoutShell = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  const mode = useResponsiveMode();

  if (mode === "mobile") {
    return (
      <MobileShell>
        <MobileTopBar>{sidebar}</MobileTopBar>
        <AppMain>
          <Outlet />
        </AppMain>
      </MobileShell>
    );
  }

  return (
    <AppShell>
      <AppSidebar id="tour-sidebar-workspaces">{sidebar}</AppSidebar>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  );
};
