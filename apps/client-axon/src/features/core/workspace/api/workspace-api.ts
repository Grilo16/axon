import { axonApi } from "@app/api/axon-api";
import type {
  WorkspaceRecord,
  UpdateWorkspacePayload,
  CreateWorkspaceReq,
  DirQuery,
  ReadFileReq,
  ListWorkspacesQuery,
  FileQuery,
  SearchQuery,
} from "@shared/types/axon-core/workspace-api";
import type { ExplorerEntry } from "@shared/types/axon-core/explorer";

export const workspaceApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    createWorkspace: builder.mutation<WorkspaceRecord, CreateWorkspaceReq>({
      query: (payload) => ({
        command: "create_workspace",
        url: "/v1/workspaces",
        method: "POST",
        body: payload,
        tauriArgs: { payload },
      }),
      invalidatesTags: ["Workspace"],
    }),
    getWorkspace: builder.query<WorkspaceRecord, string>({
      query: (id) => ({
        command: "get_workspace",
        url: `/v1/workspaces/${id}`,
        method: "GET",
        tauriArgs: { id },
      }),
      providesTags: (_result, _error, id) => [{ type: "Workspace", id }],
    }),
    listWorkspaces: builder.query<WorkspaceRecord[], ListWorkspacesQuery>({
      query: (query) => ({
        command: "list_workspaces",
        url: `/v1/workspaces?limit=${query.limit || 50}&offset=${query.offset || 0}`,
        method: "GET",
        tauriArgs: { query },
      }),
      providesTags: ["Workspace"],
    }),
    updateWorkspace: builder.mutation<
      void,
      { id: string; payload: UpdateWorkspacePayload }
    >({
      query: ({ id, payload }) => ({
        command: "update_workspace",
        url: `/v1/workspaces/${id}`,
        method: "PATCH",
        body: payload,
        tauriArgs: { id, payload },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Workspace", id },
        "Workspace",
      ],
    }),

    deleteWorkspace: builder.mutation<void, string>({
      query: (id) => ({
        command: "delete_workspace",
        url: `/v1/workspaces/${id}`,
        method: "DELETE",
        tauriArgs: { id },
      }),
      invalidatesTags: ["Workspace"],
    }),

    rescanWorkspace: builder.mutation<void, string>({
      query: (id) => ({
        command: "rescan_workspace",
        url: `/v1/workspaces/${id}/rescan`,
        method: "POST",
        tauriArgs: { id },
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Workspace", id },
        { type: "Workspace", id: `ALL-${id}` },
        "Bundle",
      ],
    }),

    getAllFilePaths: builder.query<string[], { id: string; query: FileQuery }>({
      query: ({ id, query }) => ({
        command: "get_all_file_paths",
        url: `/v1/workspaces/${id}/files${query.limit ? `?limit=${query.limit}` : ""}`,
        method: "GET",
        tauriArgs: { id, query },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Workspace" as const, id: `ALL-${arg.id}` },
      ],
    }),
    getFilePathsByDir: builder.query<string[], { id: string; query: DirQuery }>(
      {
        query: ({ id, query }) => ({
          command: "get_file_paths_by_dir",
          url: `/v1/workspaces/${id}/files/dir?path=${encodeURIComponent(query.path)}&recursive=${query.recursive}${query.limit ? `&limit=${query.limit}` : ""}`,
          method: "GET",
          tauriArgs: { id, query },
        }),
      },
    ),
    readFile: builder.query<string, { id: string; query: ReadFileReq }>({
      query: ({ id, query }) => ({
        command: "read_file",
        url: `/v1/workspaces/${id}/files/read?path=${encodeURIComponent(query.path)}`,
        method: "GET",
        tauriArgs: { id, query },
      }),
    }),
    listDirectory: builder.query<
      ExplorerEntry[],
      { id: string; query: ReadFileReq }
    >({
      query: ({ id, query }) => ({
        command: "list_directory",
        url: `/v1/workspaces/${id}/explorer?path=${encodeURIComponent(query.path)}`,
        method: "GET",
        tauriArgs: { id, query },
      }),
      providesTags: (_result, _error, { id, query }) => [
        { type: "Workspace", id: `${id}-dir-${query.path ?? "root"}` },
      ],
    }),
    searchFiles: builder.query<string[], { id: string; query: SearchQuery }>({
      query: ({ id, query }) => ({
        command: "search_files",
        url: `/v1/workspaces/${id}/search?value=${encodeURIComponent(query.value)}${query.limit ? `&limit=${query.limit}`: ""}`,
        method: "GET",
        tauriArgs: { id, query },
      }),
    }),
  }),
});

export const {
  useCreateWorkspaceMutation,
  useGetWorkspaceQuery,
  useListWorkspacesQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useRescanWorkspaceMutation,
  useGetAllFilePathsQuery,
  useLazyGetAllFilePathsQuery,
  useGetFilePathsByDirQuery,
  useLazyGetFilePathsByDirQuery,
  useReadFileQuery,
  useLazyReadFileQuery,
  useListDirectoryQuery,
  useLazyListDirectoryQuery,
  useSearchFilesQuery,
} = workspaceApi;
