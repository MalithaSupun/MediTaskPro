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

    const latestCall = segmentedControl.mock.calls[segmentedControl.mock.calls.length - 1];
    expect(latestCall).toBeDefined();

    const controlProps = latestCall?.[0] as {
      onChange: (value: 'System' | 'Light' | 'Dark') => void;
    };

    await ReactTestRenderer.act(async () => {
      controlProps.onChange('Dark');
      await Promise.resolve();
    });

    expect(store.getState().preferences.themeMode).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.THEME_MODE,
      JSON.stringify('dark'),
    );
  });
});
