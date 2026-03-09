import { axonApi } from "@app/api/axon-api";
import type { AxonGraphView } from "@features/axon-graph/types";
import type {
  BundleRecord,
  UpdateBundlePayload,
  CreateBundleReq,
  CloneBundleReq,
  ListBundlesQuery,
} from "@shared/types/axon-core/bundle-api";

export interface UpdateBundleReq {
        id: string;
        workspaceId: string;
        payload: UpdateBundlePayload;
        intent: "name" | "graph" | "context" | "all";
}

export const bundleApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    createBundle: builder.mutation<BundleRecord, CreateBundleReq>({
      query: (payload) => ({
        command: "create_bundle",
        url: "/v1/bundles",
        method: "POST",
        body: payload,
        tauriArgs: { payload },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Bundle", id: `LIST-${arg.workspaceId}` },
      ],
    }),
    cloneBundle: builder.mutation<
      BundleRecord,
      { id: string; payload: CloneBundleReq }
    >({
      query: ({ id, payload }) => ({
        command: "duplicate_bundle",
        url: `/v1/bundles/${id}/clone`,
        method: "POST",
        body: payload,
        tauriArgs: { id, payload },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Bundle", id: `LIST-${id}` },
      ],
    }),

    getBundle: builder.query<BundleRecord, string>({
      query: (id) => ({
        command: "get_bundle",
        url: `/v1/bundles/${id}`,
        method: "GET",
        tauriArgs: { id },
      }),
      providesTags: (_result, _error, id) => [{ type: "Bundle", id }],
    }),

    getWorkspaceBundles: builder.query<
      BundleRecord[],
      { id: string; query: ListBundlesQuery }
    >({
      query: ({ id, query }) => ({
        command: "get_workspace_bundles",
        url: `/v1/workspaces/${id}/bundles`,
        method: "GET",
        tauriArgs: { id, query },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Bundle", id: `LIST-${arg.id}` },
      ],
    }),

    updateBundle: builder.mutation<
      void,
      UpdateBundleReq
    >({
      query: ({ id, payload }) => ({
        command: "update_bundle",
        url: `/v1/bundles/${id}`,
        method: "PATCH",
        body: payload,
        tauriArgs: { id, payload },
        responseHandler: "text",
      }),
      invalidatesTags: (_result, _error, { id, intent, workspaceId }) => {
        switch (intent) {
          case "name":
            return [
              { type: "Bundle", id },
              { type: "Bundle", id: `LIST-${workspaceId}` },
            ];
          case "graph":
            return [
              { type: "Bundle", id },
              { type: "Bundle", id: `${id}-graph` },
              { type: "Bundle", id: `${id}-context` },
            ];
          case "context":
            return [
              { type: "Bundle", id },
              { type: "Bundle", id: `${id}-context` },
            ];
          default:
            return [
              { type: "Bundle", id: `LIST-${workspaceId}` },
              { type: "Bundle", id: `${id}-graph` },
              { type: "Bundle", id: `${id}-context` },
            ];
        }
      },
    }),
    deleteBundle: builder.mutation<void, { id: string; workspaceId: string }>({
      query: ({ id }) => ({
        command: "delete_bundle",
        url: `/v1/bundles/${id}`,
        method: "DELETE",
        tauriArgs: { id },
      }),
      invalidatesTags: (_result, _error, { id, workspaceId }) => [
        { type: "Bundle", id },
        { type: "Bundle", id: `LIST-${workspaceId}` },
      ],
    }),
    getBundleGraph: builder.query<AxonGraphView, string>({
      query: (id) => ({
        command: "get_bundle_graph",
        url: `/v1/bundles/${id}/graph`,
        method: "GET",
        tauriArgs: { id },
      }),
      providesTags: (_result, _error, id) => [
        { type: "Bundle", id: `${id}-graph` },
      ],
    }),
    getGeneratedContext: builder.query<string, { id: string; name: string }>({
      query: ({ id }) => ({
        command: "generate_bundle",
        url: `/v1/bundles/${id}/generate`,
        method: "GET",
        tauriArgs: { id },
      }),
      transformResponse: (response: Record<string, string>, _meta, arg) => {
        const fileEntries = Object.entries(response);
        return [
          `# BUNDLED CONTEXT: ${arg.name}`,
          ...fileEntries.map(
            ([path, content]) =>
              `## File: ${path}\n\`\`\`typescript\n${content}\n\`\`\``,
          ),
        ].join("\n\n");
      },
      providesTags: (_result, _error, { id }) => [
        { type: "Bundle", id: `${id}-context` },
      ],
    }),
  }),
});

export const {
  useCreateBundleMutation,
  useCloneBundleMutation,
  useGetBundleQuery,
  useGetWorkspaceBundlesQuery,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
  useGetBundleGraphQuery,
  useGetGeneratedContextQuery,
} = bundleApi;
