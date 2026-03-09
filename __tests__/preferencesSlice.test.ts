import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '../src/constants/storage';
import preferencesReducer, {
  hydratePreferences,
  setThemeMode,
} from '../src/store/preferencesSlice';

function createTestStore() {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
    },
  });
}

describe('preferencesSlice', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('hydrates valid stored theme mode', async () => {
    const store = createTestStore();

    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, JSON.stringify('dark'));
    await store.dispatch(hydratePreferences());

    expect(store.getState().preferences.themeMode).toBe('dark');
  });

  test('falls back to system when stored value is invalid', async () => {
    const store = createTestStore();

    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, JSON.stringify('blue'));
    await store.dispatch(hydratePreferences());

    expect(store.getState().preferences.themeMode).toBe('system');
  });

  test('persists selected theme mode', async () => {
    const store = createTestStore();

    await store.dispatch(setThemeMode('light'));

    expect(store.getState().preferences.themeMode).toBe('light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.THEME_MODE,
      JSON.stringify('light'),
    );
  });
});
