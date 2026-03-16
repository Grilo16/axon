import React from "react";
import { AuthContext, type AuthContextProps } from "react-oidc-context";

const mockTauriAuthValue = {
  isAuthenticated: true,
  isLoading: false,
  activeNavigator: undefined,
  user: {
    profile: { preferred_username: "Local Tauri User" },
    access_token: "tauri-local-mode",
  },
  signinRedirect: async () => {},
  signoutRedirect: async () => {},
  removeUser: async () => {},
} as unknown as AuthContextProps;

export const TauriAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={mockTauriAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};