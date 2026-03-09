import { axonApi } from "@app/api/axon-api";
import type { 
  WorkspaceRecord, DirQuery, ReadFileReq, FileQuery 
} from "@shared/types/axon-core/workspace-api";
import type { ExplorerEntry } from "@shared/types/axon-core/explorer";
import type { AxonGraphView } from "@features/axon-graph/types";
import type { StatelessGraphReq, StatelessGenerateReq } from "@shared/types/axon-core/public-api"; 

export const publicApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicWorkspaces: builder.query<WorkspaceRecord[], void>({
      query: () => ({
        command: "list_public_workspaces", 
        url: `/v1/public/workspaces`,
        method: "GET",
      }),
    }),
    
    getPublicAllFilePaths: builder.query<string[], { id: string; query: FileQuery }>({
      query: ({ id, query }) => ({
        command: "get_public_all_file_paths",
        url: `/v1/public/workspaces/${id}/files${query.limit ? `?limit=${query.limit}` : ''}`,
        method: "GET",
      }),
    }),

    getPublicFilePathsByDir: builder.query<string[], { id: string; query: DirQuery }>({
      query: ({ id, query }) => ({
        command: "get_public_file_paths_by_dir",
        url: `/v1/public/workspaces/${id}/files/dir?path=${encodeURIComponent(query.path)}&recursive=${query.recursive}${query.limit ? `&limit=${query.limit}` : ""}`,
        method: "GET",
      }),
    }),

    readPublicFile: builder.query<string, { id: string; query: ReadFileReq }>({
      query: ({ id, query }) => ({
        command: "read_public_file",
        url: `/v1/public/workspaces/${id}/files/read?path=${encodeURIComponent(query.path)}`,
        method: "GET",
      }),
    }),

    listPublicDirectory: builder.query<ExplorerEntry[], { id: string; query: ReadFileReq }>({
      query: ({ id, query }) => ({
        command: "list_public_directory",
        url: `/v1/public/workspaces/${id}/explorer?path=${encodeURIComponent(query.path)}`,
        method: "GET",
      }),
    }),

    getPublicGraph: builder.query<AxonGraphView, StatelessGraphReq>({
      query: (payload) => ({
        command: "get_public_graph",
        url: `/v1/public/bundles/graph`,
        method: "POST",
        body: payload,
      }),
    }),

    generatePublicCode: builder.mutation<Record<string, string>, StatelessGenerateReq>({
      query: (payload) => ({
        command: "generate_public_code",
        url: `/v1/public/bundles/generate`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useListPublicWorkspacesQuery,
  useGetPublicAllFilePathsQuery,
  useLazyGetPublicAllFilePathsQuery,
  useGetPublicFilePathsByDirQuery,
  useLazyGetPublicFilePathsByDirQuery,
  useReadPublicFileQuery,
  useLazyReadPublicFileQuery,
  useListPublicDirectoryQuery,
  useLazyListPublicDirectoryQuery,
  useGetPublicGraphQuery,
  useGeneratePublicCodeMutation,
} = publicApi;