import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '../constants/storage';
import { readJsonValue, writeJsonValue } from '../utils/storage';

export interface SessionUser {
  fullName: string;
  email: string;
}

interface SessionState {
  user: SessionUser | null;
  hydrating: boolean;
  saving: boolean;
  error: string | null;
}

interface SessionThunkState {
  session: SessionState;
}

interface StartSessionArgs {
  email: string;
  fullName?: string;
}

const initialState: SessionState = {
  user: null,
  hydrating: false,
  saving: false,
  error: null,
};

function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function deriveDisplayNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const cleanedValue = localPart.replace(/[\W_]+/g, ' ').trim();

  if (!cleanedValue) {
    return 'Medical Professional';
  }

  return toTitleCase(cleanedValue);
}

function validateDisplayName(value: string): string | null {
  if (value.length < 2) {
    return 'session.validation.nameMin';
  }

  if (value.length > 50) {
    return 'session.validation.nameMax';
  }

  return null;
}

async function persistSessionUser(user: SessionUser | null): Promise<void> {
  if (user) {
    await writeJsonValue(STORAGE_KEYS.USER_SESSION, user);
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
}

export const hydrateSession = createAsyncThunk<SessionUser | null, void, { rejectValue: string }>(
  'session/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      return await readJsonValue<SessionUser | null>(STORAGE_KEYS.USER_SESSION, null);
    } catch {
      return rejectWithValue('session.errors.restoreSession');
    }
  },
);

export const startSession = createAsyncThunk<SessionUser, StartSessionArgs, { rejectValue: string }>(
  'session/start',
  async (args, { rejectWithValue }) => {
    const email = args.email.trim().toLowerCase();

    if (!email) {
      return rejectWithValue('session.validation.emailRequired');
    }

    const providedName = normalizeDisplayName(args.fullName ?? '');
    const fullName = providedName || deriveDisplayNameFromEmail(email);
    const validationError = validateDisplayName(fullName);

    if (validationError) {
      return rejectWithValue(validationError);
    }

    const user: SessionUser = {
      fullName,
      email,
    };

    try {
      await persistSessionUser(user);
      return user;
    } catch {
      return rejectWithValue('session.errors.saveSession');
    }
  },
);

export const updateSessionName = createAsyncThunk<SessionUser, string, { state: SessionThunkState; rejectValue: string }>(
  'session/updateName',
  async (nextName, { getState, rejectWithValue }) => {
    const existingUser = getState().session.user;

    if (!existingUser) {
      return rejectWithValue('session.errors.noActiveAccount');
    }

    const fullName = normalizeDisplayName(nextName);
    const validationError = validateDisplayName(fullName);

    if (validationError) {
      return rejectWithValue(validationError);
    }

    const nextUser: SessionUser = {
      ...existingUser,
      fullName,
    };

    try {
      await persistSessionUser(nextUser);
      return nextUser;
    } catch {
      return rejectWithValue('session.errors.updateNameNow');
    }
  },
);

export const signOutSession = createAsyncThunk<void, void, { rejectValue: string }>(
  'session/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await persistSessionUser(null);
      return;
    } catch {
      return rejectWithValue('session.errors.signOut');
    }
  },
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(hydrateSession.pending, state => {
        state.hydrating = true;
        state.error = null;
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.hydrating = false;
        state.error = null;
      })
      .addCase(hydrateSession.rejected, (state, action) => {
        state.hydrating = false;
        state.error = action.payload ?? action.error.message ?? 'session.errors.failedRestore';
      })
      .addCase(startSession.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.saving = false;
        state.error = null;
      })
      .addCase(startSession.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? action.error.message ?? 'session.errors.failedStart';
      })
      .addCase(updateSessionName.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSessionName.fulfilled, (state, action) => {
        state.user = action.payload;
        state.saving = false;
        state.error = null;
      })
      .addCase(updateSessionName.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? action.error.message ?? 'session.errors.failedUpdateName';
      })
      .addCase(signOutSession.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(signOutSession.fulfilled, state => {
        state.user = null;
        state.saving = false;
        state.error = null;
      })
      .addCase(signOutSession.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? action.error.message ?? 'session.errors.failedSignOut';
      });
  },
});

export default sessionSlice.reducer;
