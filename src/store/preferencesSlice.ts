import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '../constants/storage';
import { readJsonValue, writeJsonValue } from '../utils/storage';

export const THEME_MODES = ['system', 'light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

interface PreferencesState {
  themeMode: ThemeMode;
  hydrating: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  themeMode: 'system',
  hydrating: false,
  saving: false,
  error: null,
};

function isThemeMode(value: unknown): value is ThemeMode {
  if (typeof value !== 'string') {
    return false;
  }

  return THEME_MODES.includes(value as ThemeMode);
}

export const hydratePreferences = createAsyncThunk<ThemeMode, void, { rejectValue: string }>(
  'preferences/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      const storedValue = await readJsonValue<unknown>(STORAGE_KEYS.THEME_MODE, 'system');

      return isThemeMode(storedValue) ? storedValue : 'system';
    } catch {
      return rejectWithValue('Unable to restore preferences.');
    }
  },
);

export const setThemeMode = createAsyncThunk<ThemeMode, ThemeMode, { rejectValue: string }>(
  'preferences/setThemeMode',
  async (themeMode, { rejectWithValue }) => {
    if (!isThemeMode(themeMode)) {
      return rejectWithValue('Unsupported theme mode.');
    }

    try {
      await writeJsonValue(STORAGE_KEYS.THEME_MODE, themeMode);
      return themeMode;
    } catch {
      return rejectWithValue('Unable to save theme mode.');
    }
  },
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferencesError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydratePreferences.pending, state => {
        state.hydrating = true;
        state.error = null;
      })
      .addCase(hydratePreferences.fulfilled, (state, action) => {
        state.themeMode = action.payload;
        state.hydrating = false;
        state.error = null;
      })
      .addCase(hydratePreferences.rejected, (state, action) => {
        state.hydrating = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to restore preferences.';
      })
      .addCase(setThemeMode.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setThemeMode.fulfilled, (state, action) => {
        state.themeMode = action.payload;
        state.saving = false;
        state.error = null;
      })
      .addCase(setThemeMode.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to save theme mode.';
      });
  },
});

export const { clearPreferencesError } = preferencesSlice.actions;

export default preferencesSlice.reducer;
