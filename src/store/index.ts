import { configureStore, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

import sessionReducer from './sessionSlice';
import tasksReducer from './tasksSlice';

const globalErrorHandlingMiddleware: Middleware = () => next => action => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload;

    if (typeof payload === 'string') {
      console.warn('[GlobalErrorMiddleware]', payload);
    }
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    tasks: tasksReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(globalErrorHandlingMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
