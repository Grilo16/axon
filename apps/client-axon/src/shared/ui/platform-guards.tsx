import { IS_TAURI, IS_WEB } from '@app/constants';
import React from 'react';

interface GuardProps {
  children: React.ReactNode;
}

export const WebOnly: React.FC<GuardProps> = ({ children }) => {
  if (!IS_WEB) return null;
  return <>{children}</>;
};

export const TauriOnly: React.FC<GuardProps> = ({ children }) => {
  if (!IS_TAURI) return null;
  return <>{children}</>;
};