import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { toggleTheme, setThemeMode, selectThemeMode } from './themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  
  const isDark = mode === 'dark';

  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const setMode = useCallback((newMode: 'light' | 'dark') => {
    dispatch(setThemeMode(newMode));
  }, [dispatch]);

  return {
    mode,
    isDark,
    toggle,
    setMode
  };
};