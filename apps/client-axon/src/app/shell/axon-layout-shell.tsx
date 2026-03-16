import React from "react";
import { Outlet } from "react-router-dom";
import { AppMain, AppShell, AppSidebar, Flex, Text } from "@shared/ui";
import { useResponsiveMode } from "@shared/hooks/use-responsive-mode";
import { MonitorX } from "lucide-react";
// import styled from "styled-components";

// const MobileShell = styled.div`
//   display: flex;
//   flex-direction: column;
//   width: 100%;
//   height: 100vh;
//   height: 100dvh;
//   overflow: hidden;
//   background-color: ${({ theme }) => theme.colors.bg.main};
// `;

// const MobileTopBar = styled.div`
//   display: flex;
//   align-items: center;
//   height: 48px;
//   flex-shrink: 0;
//   padding: 0 ${({ theme }) => theme.spacing.sm};
//   gap: ${({ theme }) => theme.spacing.xs};
//   background-color: ${({ theme }) => theme.colors.bg.surface};
//   border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
//   overflow: hidden;
// `;

export const AxonLayoutShell = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  const mode = useResponsiveMode();
 if (mode === "mobile" ) {
    return (
      <Flex 
        $fill 
        $direction="column" 
        $align="center" 
        $justify="center" 
        $bg="bg.main" 
        $gap="md" 
        style={{ textAlign: "center", padding: "2rem" }}
      >
        <MonitorX size={56} color="#60a5fa" style={{ marginBottom: "1rem" }} />
        
        <Text $size="h2" $weight="bold" $color="primary">
          Axon is a Desktop Experience 🧠
        </Text>
        
        <Text $size="md" $color="secondary" style={{ maxWidth: "400px", lineHeight: 1.6 }}>
          Visualizing and bundling complex codebase architectures requires serious screen real estate. 
          <br /><br />
          Please bookmark this page or send the link to yourself, and open it on your desktop monitor to experience the magic!
        </Text>
      </Flex>
    );
  }

  // if (mode === "mobile") {
  //   return (
  //     <MobileShell>
  //       <MobileTopBar id="tour-sidebar-workspaces">
  //         {sidebar}
  //       </MobileTopBar>
  //       <AppMain>
  //         <Outlet />
  //       </AppMain>
  //     </MobileShell>
  //   );
  // }

  return (
    <AppShell>
      <AppSidebar id="tour-sidebar-workspaces">{sidebar}</AppSidebar>
      <AppMain>
        <Outlet />
      </AppMain>
    </AppShell>
  );
};
