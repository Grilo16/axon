import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppMain, AppShell, AppSidebar } from '@shared/ui';


export const AxonLayoutShell = ({ sidebar }: { sidebar?: React.ReactNode }) => {
  return (
    <AppShell>
      <AppSidebar>
        {sidebar}
      </AppSidebar>
      <AppMain>
        <Outlet /> 
      </AppMain>
    </AppShell>
  );
};