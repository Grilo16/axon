import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [current, setCurrent] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const push = useCallback((newState: T) => {
    if (newState === current) return;
    setPast((prev) => [...prev, current]);
    setCurrent(newState);
    setFuture([]); 
  }, [current]);

  const goBack = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [current, ...prev]);
    setPast(newPast);
    setCurrent(previous);
    return previous;
  }, [past, current]);

  const goForward = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev, current]);
    setFuture(newFuture);
    setCurrent(next);
    return next;
  }, [future, current]);

  return {
    state: current,
    push,
    goBack,
    goForward,
    canGoBack: past.length > 0,
    canGoForward: future.length > 0,
  };
}