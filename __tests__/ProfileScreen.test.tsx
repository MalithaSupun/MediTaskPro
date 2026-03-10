import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { STORAGE_KEYS } from '../src/constants/storage';
import ProfileScreen from '../src/screens/profile/ProfileScreen';
import preferencesReducer from '../src/store/preferencesSlice';
import sessionReducer from '../src/store/sessionSlice';
import tasksReducer from '../src/store/tasksSlice';

const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: () => ({
      getParent: () => ({ replace: mockReplace }),
    }),
  };
});

jest.mock('../src/components/SegmentedControl', () => {
  const ReactModule = require('react');
  return jest.fn(() => ReactModule.createElement(ReactModule.Fragment, null));
});

jest.mock('../src/utils/toast', () => ({
  showToast: jest.fn(),
}));

function createStore() {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      session: sessionReducer,
      tasks: tasksReducer,
    },
  });
}

describe('ProfileScreen appearance settings', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('updates and persists theme mode from appearance control', async () => {
    const store = createStore();
    const segmentedControl = jest.requireMock('../src/components/SegmentedControl') as jest.Mock;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider
            initialMetrics={{
              frame: { x: 0, y: 0, width: 375, height: 812 },
              insets: { top: 0, right: 0, bottom: 0, left: 0 },
            }}
          >
            <ProfileScreen />
          </SafeAreaProvider>
        </Provider>,
      );
    });

    const themeControlCall = segmentedControl.mock.calls.find(call => {
      const options = call?.[0]?.options as unknown;

      return (
        Array.isArray(options) &&
        options.length === 3 &&
        options[0] === 'system' &&
        options[1] === 'light' &&
        options[2] === 'dark'
      );
    });
    expect(themeControlCall).toBeDefined();

    const controlProps = themeControlCall?.[0] as {
      onChange: (value: 'system' | 'light' | 'dark') => void;
    };

    await ReactTestRenderer.act(async () => {
      controlProps.onChange('dark');
      await Promise.resolve();
    });

    expect(store.getState().preferences.themeMode).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.THEME_MODE,
      JSON.stringify('dark'),
    );
  });

  test('updates and persists app language from appearance control', async () => {
    const store = createStore();
    const segmentedControl = jest.requireMock('../src/components/SegmentedControl') as jest.Mock;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider
            initialMetrics={{
              frame: { x: 0, y: 0, width: 375, height: 812 },
              insets: { top: 0, right: 0, bottom: 0, left: 0 },
            }}
          >
            <ProfileScreen />
          </SafeAreaProvider>
        </Provider>,
      );
    });

    const languageControlCall = segmentedControl.mock.calls.find(call => {
      const options = call?.[0]?.options as unknown;

      return (
        Array.isArray(options) &&
        options.length === 3 &&
        options[0] === 'en' &&
        options[1] === 'si' &&
        options[2] === 'ta'
      );
    });
    expect(languageControlCall).toBeDefined();

    const controlProps = languageControlCall?.[0] as {
      onChange: (value: 'en' | 'si' | 'ta') => void;
    };

    await ReactTestRenderer.act(async () => {
      controlProps.onChange('si');
      await Promise.resolve();
    });

    expect(store.getState().preferences.language).toBe('si');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.APP_LANGUAGE,
      JSON.stringify('si'),
    );
  });
});
