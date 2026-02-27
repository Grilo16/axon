import { axonApi } from '@app/api/axon-api';
import type { AxonGraphView } from '../types';
import { AXON_COMMANDS } from '@shared/api/commands';

export const graphApi = axonApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getFocusedGraph: builder.query<AxonGraphView, { requestedPaths: string[] }>({
      query: (args) => ({
        command: AXON_COMMANDS.GRAPH.GET_FOCUSED_GRAPH,
        body: args,
        url: '/graph/focused',
        method: 'POST', 
      }),
      providesTags: ['Graph'],
    }),

  }),
  overrideExisting: false,
});

export const { useGetFocusedGraphQuery } = graphApi;