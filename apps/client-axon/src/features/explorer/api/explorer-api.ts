import { axonApi } from "@app/api/axon-api";
import { AXON_COMMANDS } from "@shared/api/commands";
import type { ExplorerEntry } from "@shared/types/axon-core/explorer";

export const explorerApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    listDirectory: builder.query<ExplorerEntry[], { path: string }>({
      query: (args) => {
        // We safely encode the file path so slashes don't break the web backend router
        const encodedPath = encodeURIComponent(args.path);
        console.log(encodedPath)
        return {
          // === TAURI CONFIG ===
          command: AXON_COMMANDS.EXPLORER.LIST_DIRECTORY,
          // We pass args to body here ONLY for Tauri's invoke parameter mapping
          body: args,

          // === WEB HTTP CONFIG ===
          url: `/explorer/directory?path=${encodedPath}`,
          method: "GET",
        };
      },
      // Since this is the explorer, we give it its own domain tag
      providesTags: (_result, _error, args) => [
        { type: "Explorer", id: args.path },
      ],
    }),
  }),
});

export const { useListDirectoryQuery, useLazyListDirectoryQuery } = explorerApi;
