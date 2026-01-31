import React from 'react';
import styled from 'styled-components';
import { Surface } from '@components/ui/Surface';
import { Outlet } from 'react-router-dom';

const LayoutContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const SidebarContainer = styled(Surface)`
  width: 60px; /* Collapsed width */
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  /* Sidebar is usually 'surface' color */
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const ContentArea = styled.main`
  flex: 1;
  position: relative;
  background-color: ${({ theme }) => theme.colors.bg.main};
  /* The canvas will live here */
`;

// 👇 Update Props: Remove 'children'
export const MainLayout = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  return (
    <LayoutContainer>
      {/* Sidebar Slot */}
      <SidebarContainer $variant="surface" $radius="none" $padding={0}>
        {sidebar}
      </SidebarContainer>

      {/* Main Content Slot */}
      <ContentArea>
        <Outlet /> {/* 👈 This renders the WelcomePage or WorkspacePage! */}
      </ContentArea>
    </LayoutContainer>
  );
};