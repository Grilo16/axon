import styled from "styled-components";

/**
 * The absolute root container for the application.
 * Forces a 100vw/100vh strict boundary.
 */
export const AppShell = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.bg.main};
`;

/**
 * The ultra-thin, icon-only global navigation sidebar.
 */
export const AppSidebar = styled.aside`
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.lg} 0`};
  gap: ${({ theme }) => theme.spacing.md};
  
  background-color: ${({ theme }) => theme.colors.bg.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.subtle};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
`;

/**
 * The flexible main area that sits next to the Sidebar.
 * This holds everything else (Panels, Canvas).
 */
export const AppMain = styled.main`
  flex: 1;
  min-width: 0; 
  height: 100%;
  display: flex;
  position: relative;
`;