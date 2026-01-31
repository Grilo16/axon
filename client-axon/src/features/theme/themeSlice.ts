import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '@app/store';
import { darkTheme, lightTheme } from '@theme/themes'; 
import { type AxonTheme } from '@axon-types/themeTypes';

interface ThemeState {
  mode: 'light' | 'dark';
}

// Check local storage or system preference for default
const getInitialMode = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('axon-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: ThemeState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('axon-theme', state.mode);
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('axon-theme', state.mode);
    },
  },
});

export const { toggleTheme, setThemeMode } = themeSlice.actions;

// --- Selectors ---

export const selectThemeMode = (state: RootState) => state.theme.mode;

// 🧠 Smart Selector: Returns the actual Theme Object for styled-components
export const selectCurrentTheme = (state: RootState): AxonTheme => {
  return state.theme.mode === 'dark' ? darkTheme : lightTheme;
};

export default themeSlice.reducer;