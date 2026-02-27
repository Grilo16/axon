import { createApi } from '@reduxjs/toolkit/query/react';
import { dualBaseQuery } from './axon-base-query';

export const axonApi = createApi({
  reducerPath: 'axonApi',
  baseQuery: dualBaseQuery,
  tagTypes: ['Graph', 'Workspace', "Explorer"], 
  endpoints: () => ({}), 
});