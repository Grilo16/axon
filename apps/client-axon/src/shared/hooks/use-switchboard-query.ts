import { useIsAuthenticated } from "./use-auth-mode";

type QueryLike<T> = {
  data?: T;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};

/**
 * Routes between a private (authenticated) and public RTK Query result
 * based on the current auth state. Both queries must already be called
 * with appropriate `skip` flags — this helper simply selects the active one.
 */
export function useSwitchboardQuery<T>(
  privateResult: QueryLike<T>,
  publicResult: QueryLike<T>,
): QueryLike<T> {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? privateResult : publicResult;
}
