import { axonApi } from "@app/api/axon-api";
import type { AxonGraphView } from "@features/axon-graph/types";
import type {
  BundleRecord,
  UpdateBundlePayload,
  CreateBundleReq,
  CloneBundleReq,
  ListBundlesQuery,
} from "@shared/types/axon-core/bundle-api";

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
    cloneBundle: builder.mutation<BundleRecord, { id: string; payload: CloneBundleReq }>({
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
    getWorkspaceBundles: builder.query<BundleRecord[], { id: string; query: ListBundlesQuery }>({
      query: ({ id, query }) => ({
        command: "get_workspace_bundles",
        url: `/v1/workspaces/${id}/bundles`,
        method: "GET",
        tauriArgs: { id, query },
      }),
      providesTags: (_result, _error, arg) => [{ type: "Bundle", id: `LIST-${arg.id}` }],
    }),
    updateBundle: builder.mutation<void, { id: string; workspaceId: string; payload: UpdateBundlePayload }>({
      query: ({ id, payload }) => ({
        command: "update_bundle",
        url: `/v1/bundles/${id}`,
        method: "PATCH",
        body: payload,
        tauriArgs: { id, payload },
      }),
      invalidatesTags: (_result, _error, { id, workspaceId }) => [
        { type: "Bundle", id },
        { type: "Bundle", id: `LIST-${workspaceId}` },
        { type: "Bundle", id: `LIST-${id}` },
        { type: "Bundle", id: `${id}-graph` }
      ],
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
    getBundleGraph: builder.query<AxonGraphView, { id: string; hideBarrelExports: boolean }>({ 
      query: ({ id, hideBarrelExports }) => ({
        command: "get_bundle_graph",
        url: `/v1/bundles/${id}/graph${hideBarrelExports ? '?hideBarrelExports=true' : ''}`,
        method: "GET",
        tauriArgs: { id, hideBarrelExports },
      }),
      providesTags: (_result, _error, arg) => [{ type: "Bundle", id: `${arg.id}-graph` }, {type: "Bundle", id: "graph"}],
    }),
    generateBundle: builder.mutation<Record<string, string>, string>({
      query: (id) => ({
        command: "generate_bundle",
        url: `/v1/bundles/${id}/generate`,
        method: "POST",
        tauriArgs: { id },
      }),
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
  useGenerateBundleMutation,
} = bundleApi;