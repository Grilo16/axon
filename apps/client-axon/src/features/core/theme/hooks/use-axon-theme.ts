import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { toggleTheme, setThemeMode, selectThemeMode, selectCurrentTheme } from '../theme-slice';

export const useAxonTheme = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const theme = useAppSelector(selectCurrentTheme);
  
  const isDark = mode === 'dark';

  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const setMode = useCallback((newMode: 'light' | 'dark') => {
    dispatch(setThemeMode(newMode));
  }, [dispatch]);

  return {
    theme,
    mode,
    isDark,
    toggle,
    setMode
  };
};