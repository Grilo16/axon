import { axonApi } from "@app/api/axon-api";
import { AXON_COMMANDS } from "@shared/api/commands";
import type { BundleOptions } from "@shared/types/axon-core/bundler";

export const workspaceApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    loadWorkspace: builder.mutation<void, { path: string }>({
      query: (args) => ({
        command: AXON_COMMANDS.WORKSPACE.LOAD_WORKSPACE,
        body: args,
        url: "/workspace/load",
        method: "POST",
      }),
      invalidatesTags: ["Explorer", "Graph"],
    }),

    // The Composable Query: Fetches the paths
    getAllFilePaths: builder.query<string[], { limit?: number }>({
      query: (args) => ({
        command: AXON_COMMANDS.WORKSPACE.GET_ALL_FILE_PATHS,
        body: args,
        url: `/workspace/paths${args.limit ? `?limit=${args.limit}` : ""}`,
        method: "GET",
      }),
      // We tag it so it automatically refreshes if the workspace changes
      providesTags: ["Explorer"],
    }),

    getFilePathsByDir: builder.query<string[],{ path: string; recursive: boolean; limit?: number }>({
      query: (args) => ({
        // Make sure to add GET_FILE_PATHS_BY_DIR to your AXON_COMMANDS!
        command: AXON_COMMANDS.WORKSPACE.GET_FILE_PATHS_BY_DIR,
        body: args,
        url: `/workspace/dir-paths`,
        method: "POST", // POST because we are sending a complex body with boolean/optional args
      }),
      // Tag it so it resets if the workspace changes
      providesTags: ["Explorer"],
    }),

    readFileContent: builder.query<string, { path: string }>({
      query: (args) => ({
        // Make sure to add READ_FILE to your AXON_COMMANDS in Rust/TS!
        command: AXON_COMMANDS.WORKSPACE.READ_FILE,
        body: args,
        url: `/workspace/file?path=${encodeURIComponent(args.path)}`,
        method: "GET",
      }),
    }),
    generateBundle: builder.mutation<Record<string, string>, BundleOptions>({
      query: (options) => ({
        // Make sure to add GENERATE_BUNDLE to your AXON_COMMANDS!
        command: AXON_COMMANDS.WORKSPACE.GENERATE_BUNDLE,
        // Tauri maps the exact argument name from Rust: `options`
        body: { options },
        url: `/workspace/bundle`,
        method: "POST",
      }),
    }),
  }),
});
export const {
  useLoadWorkspaceMutation,
  useLazyGetAllFilePathsQuery,
  useReadFileContentQuery,
  useLazyGetFilePathsByDirQuery,
  useGenerateBundleMutation,
} = workspaceApi;
