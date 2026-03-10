import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '../constants/storage';
import { APP_LANGUAGES, DEFAULT_LANGUAGE, type AppLanguage } from '../i18n/resources';
import { readJsonValue, writeJsonValue } from '../utils/storage';

export const THEME_MODES = ['system', 'light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

interface PreferencesState {
  themeMode: ThemeMode;
  language: AppLanguage;
  hydrating: boolean;
  saving: boolean;
  error: string | null;
}

interface HydratedPreferences {
  themeMode: ThemeMode;
  language: AppLanguage;
}

const initialState: PreferencesState = {
  themeMode: 'system',
  language: DEFAULT_LANGUAGE,
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

function isAppLanguage(value: unknown): value is AppLanguage {
  if (typeof value !== 'string') {
    return false;
  }

  return APP_LANGUAGES.includes(value as AppLanguage);
}

export const hydratePreferences = createAsyncThunk<HydratedPreferences, void, { rejectValue: string }>(
  'preferences/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      const [storedThemeMode, storedLanguage] = await Promise.all([
        readJsonValue<unknown>(STORAGE_KEYS.THEME_MODE, 'system'),
        readJsonValue<unknown>(STORAGE_KEYS.APP_LANGUAGE, DEFAULT_LANGUAGE),
      ]);

      return {
        themeMode: isThemeMode(storedThemeMode) ? storedThemeMode : 'system',
        language: isAppLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE,
      };
    } catch {
      return rejectWithValue('session.errors.restoreSession');
    }
  },
);

export const setThemeMode = createAsyncThunk<ThemeMode, ThemeMode, { rejectValue: string }>(
  'preferences/setThemeMode',
  async (themeMode, { rejectWithValue }) => {
    if (!isThemeMode(themeMode)) {
      return rejectWithValue('messages.themeUpdateFailed');
    }

    try {
      await writeJsonValue(STORAGE_KEYS.THEME_MODE, themeMode);
      return themeMode;
    } catch {
      return rejectWithValue('messages.themeUpdateFailed');
    }
  },
);

export const setAppLanguage = createAsyncThunk<AppLanguage, AppLanguage, { rejectValue: string }>(
  'preferences/setAppLanguage',
  async (language, { rejectWithValue }) => {
    if (!isAppLanguage(language)) {
      return rejectWithValue('messages.languageUpdateFailed');
    }

    try {
      await writeJsonValue(STORAGE_KEYS.APP_LANGUAGE, language);
      return language;
    } catch {
      return rejectWithValue('messages.languageUpdateFailed');
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
        state.themeMode = action.payload.themeMode;
        state.language = action.payload.language;
        state.hydrating = false;
        state.error = null;
      })
      .addCase(hydratePreferences.rejected, (state, action) => {
        state.hydrating = false;
        state.error = action.payload ?? 'session.errors.restoreSession';
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
        state.error = action.payload ?? 'messages.themeUpdateFailed';
      })
      .addCase(setAppLanguage.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setAppLanguage.fulfilled, (state, action) => {
        state.language = action.payload;
        state.saving = false;
        state.error = null;
      })
      .addCase(setAppLanguage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'messages.languageUpdateFailed';
      });
  },
});

export const { clearPreferencesError } = preferencesSlice.actions;

export default preferencesSlice.reducer;
