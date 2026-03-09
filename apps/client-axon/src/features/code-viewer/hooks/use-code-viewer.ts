import { useAuth } from "react-oidc-context";
import { useAppSelector } from "@app/store";
import { useReadFileQuery } from "@features/core/workspace/api/workspace-api";
import { useReadPublicFileQuery } from "@features/public/api/public-api";

export const useCodeViewer = () => {
  const { isAuthenticated } = useAuth();
  const activeWorkspaceId = useAppSelector((state) => state.workspaceUi.activeWorkspaceId);
  const viewMode = useAppSelector((state) => state.workspaceUi.viewMode);
  const viewedFilePath = useAppSelector((state) => state.workspaceUi.viewedFilePath);

  const privateQuery = useReadFileQuery(
    { id: activeWorkspaceId!, query: { path: viewedFilePath! } },
    { skip: viewMode !== "file" || !activeWorkspaceId || !viewedFilePath || !isAuthenticated } //
  );

  const publicQuery = useReadPublicFileQuery(
    { id: activeWorkspaceId!, query: { path: viewedFilePath! } },
    { skip: viewMode !== "file" || !activeWorkspaceId || !viewedFilePath || isAuthenticated } //
  );

  const activeQuery = isAuthenticated ? privateQuery : publicQuery;

  return {
    isActive: viewMode !== "none",
    mode: viewMode,
    title: viewedFilePath?.split('/').pop() || "Unknown",
    content: activeQuery.data || "",
    isLoading: activeQuery.isFetching,
    isError: activeQuery.isError,
  };
};