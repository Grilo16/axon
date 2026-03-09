import { useMemo } from "react";
import { useGetPublicGraphQuery } from "../api/public-api";
import { usePublicActions } from "./use-public-actions";
import type { StatelessGraphReq } from "@shared/types/axon-core/public-api";

export const usePublicBundleModel = (activeGraphReq?: StatelessGraphReq) => {
  // Declarative query: Only fires when a valid graph request is provided
  const graphQuery = useGetPublicGraphQuery(activeGraphReq!, {
    skip: !activeGraphReq,
  });

  const actions = usePublicActions();

  const isWorking = graphQuery.isFetching || actions.generatePublicCode.isLoading;

  return useMemo(() => ({
    // Data
    graphData: graphQuery.data,

    // Status
    isWorking,
    isGraphError: graphQuery.isError,
    isReady: graphQuery.isSuccess,

    // Actions
    generateCode: actions.generatePublicCode.handle,
  }), [graphQuery, isWorking, actions]);
};