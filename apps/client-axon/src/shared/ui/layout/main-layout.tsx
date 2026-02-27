import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { Surface } from '../Surface';

const LayoutContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const SidebarContainer = styled(Surface)`
  width: 60px; 
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const ContentArea = styled.main`
  flex: 1;
  position: relative;
  background-color: ${({ theme }) => theme.colors.bg.main};
  height: 100%;
  width: 100%;
`;

export const MainLayout = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  return (
    <LayoutContainer>
      <SidebarContainer $variant="surface" $radius="none" $padding={0}>
        {sidebar}
      </SidebarContainer>

      <ContentArea>
        <Outlet /> 
      </ContentArea>
    </LayoutContainer>
  );
};