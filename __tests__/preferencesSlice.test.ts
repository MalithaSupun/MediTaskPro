import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';

import { STORAGE_KEYS } from '../src/constants/storage';
import preferencesReducer, {
  hydratePreferences,
  setAppLanguage,
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
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, JSON.stringify('ta'));
    await store.dispatch(hydratePreferences());

    expect(store.getState().preferences.themeMode).toBe('dark');
    expect(store.getState().preferences.language).toBe('ta');
  });

  test('falls back to system when stored value is invalid', async () => {
    const store = createTestStore();

    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, JSON.stringify('blue'));
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, JSON.stringify('jp'));
    await store.dispatch(hydratePreferences());

    expect(store.getState().preferences.themeMode).toBe('system');
    expect(store.getState().preferences.language).toBe('en');
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

  test('persists selected app language', async () => {
    const store = createTestStore();

    await store.dispatch(setAppLanguage('si'));

    expect(store.getState().preferences.language).toBe('si');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.APP_LANGUAGE,
      JSON.stringify('si'),
    );
  });
});
