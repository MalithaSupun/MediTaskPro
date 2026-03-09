/* eslint-env jest */

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () => {
  let storage = {};

  const asyncStorageMock = {
    setItem: jest.fn((key, value) => {
      storage[key] = value;
      return Promise.resolve(null);
    }),
    getItem: jest.fn(key => Promise.resolve(storage[key] ?? null)),
    removeItem: jest.fn(key => {
      delete storage[key];
      return Promise.resolve(null);
    }),
    clear: jest.fn(() => {
      storage = {};
      return Promise.resolve(null);
    }),
    multiSet: jest.fn(entries => {
      entries.forEach(([key, value]) => {
        storage[key] = value;
      });
      return Promise.resolve(null);
    }),
    multiGet: jest.fn(keys => Promise.resolve(keys.map(key => [key, storage[key] ?? null]))),
    multiRemove: jest.fn(keys => {
      keys.forEach(key => {
        delete storage[key];
      });
      return Promise.resolve(null);
    }),
  };

  return {
    __esModule: true,
    ...asyncStorageMock,
    default: asyncStorageMock,
  };
});
