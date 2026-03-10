import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { isApiError } from '../api/axiosInstance';
import { createTodo, deleteTodo, getTodos, updateTodo } from '../api/todoService';
import { STORAGE_KEYS } from '../constants/storage';
import {
  type SyncOperation,
  type Task,
  type TaskInput,
  type TaskStatus,
  type TaskUpdateInput,
} from '../types/task';
import { readJsonValue, writeJsonValue } from '../utils/storage';

interface PersistedTasksState {
  tasks: Task[];
  queue: SyncOperation[];
  lastSyncedAt: string | null;
}

interface TasksSyncPayload extends PersistedTasksState {
  isOffline: boolean;
  infoMessage: string | null;
}

interface TasksState extends PersistedTasksState {
  loading: boolean;
  refreshing: boolean;
  mutating: boolean;
  initialized: boolean;
  error: string | null;
  infoMessage: string | null;
  isOffline: boolean;
}

interface CreateTaskArgs extends TaskInput {
  status?: TaskStatus;
}

interface UpdateTaskArgs {
  id: string;
  changes: TaskUpdateInput;
}

interface DeleteTaskArgs {
  id: string;
}

interface SliceThunkState {
  tasks: TasksState;
}

const initialState: TasksState = {
  tasks: [],
  queue: [],
  lastSyncedAt: null,
  loading: false,
  refreshing: false,
  mutating: false,
  initialized: false,
  error: null,
  infoMessage: null,
  isOffline: false,
};

function resetTasksSliceState(state: TasksState): void {
  state.tasks = [];
  state.queue = [];
  state.lastSyncedAt = null;
  state.loading = false;
  state.refreshing = false;
  state.mutating = false;
  state.initialized = false;
  state.error = null;
  state.infoMessage = null;
  state.isOffline = false;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((firstTask, secondTask) => {
    const firstTimestamp = Date.parse(firstTask.updatedAt || firstTask.createdAt);
    const secondTimestamp = Date.parse(secondTask.updatedAt || secondTask.createdAt);

    return secondTimestamp - firstTimestamp;
  });
}

function generateOperationId(): string {
  return `sync-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function generateLocalTaskId(): string {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

async function loadPersistedTasksState(): Promise<PersistedTasksState> {
  const [tasks, queue, lastSyncedAt] = await Promise.all([
    readJsonValue<Task[]>(STORAGE_KEYS.TASK_CACHE, []),
    readJsonValue<SyncOperation[]>(STORAGE_KEYS.TASK_SYNC_QUEUE, []),
    AsyncStorage.getItem(STORAGE_KEYS.TASK_LAST_SYNCED_AT),
  ]);

  return {
    tasks: sortTasks(tasks),
    queue,
    lastSyncedAt,
  };
}

async function persistTasksState(state: PersistedTasksState): Promise<void> {
  await Promise.all([
    writeJsonValue(STORAGE_KEYS.TASK_CACHE, state.tasks),
    writeJsonValue(STORAGE_KEYS.TASK_SYNC_QUEUE, state.queue),
    state.lastSyncedAt
      ? AsyncStorage.setItem(STORAGE_KEYS.TASK_LAST_SYNCED_AT, state.lastSyncedAt)
      : AsyncStorage.removeItem(STORAGE_KEYS.TASK_LAST_SYNCED_AT),
  ]);
}

function trimTaskInput(input: TaskInput): TaskInput {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
  };
}

function trimTaskUpdateInput(input: TaskUpdateInput): TaskUpdateInput {
  return {
    title: typeof input.title === 'string' ? input.title.trim() : undefined,
    description: typeof input.description === 'string' ? input.description.trim() : undefined,
    priority: input.priority,
    status: input.status,
  };
}

function buildLocalTask(args: CreateTaskArgs): Task {
  const timestamp = new Date().toISOString();

  return {
    id: generateLocalTaskId(),
    title: args.title,
    description: args.description,
    priority: args.priority,
    status: args.status ?? 'Pending',
    createdAt: timestamp,
    updatedAt: timestamp,
    synced: false,
  };
}

function upsertTask(tasks: Task[], task: Task): Task[] {
  const withoutDuplicate = tasks.filter(existingTask => existingTask.id !== task.id);
  return sortTasks([task, ...withoutDuplicate]);
}

function mergeRemoteWithUnsynced(remoteTasks: Task[], localTasks: Task[]): Task[] {
  const taskMap = new Map<string, Task>();

  remoteTasks.forEach(remoteTask => {
    taskMap.set(remoteTask.id, { ...remoteTask, synced: true });
  });

  localTasks.forEach(localTask => {
    if (!localTask.synced) {
      taskMap.set(localTask.id, localTask);
    }
  });

  return sortTasks(Array.from(taskMap.values()));
}

function enqueueCreateOperation(queue: SyncOperation[], localTask: Task): SyncOperation[] {
  return [
    ...queue,
    {
      id: generateOperationId(),
      type: 'create',
      localId: localTask.id,
      payload: {
        title: localTask.title,
        description: localTask.description,
        priority: localTask.priority,
        status: localTask.status,
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

function enqueueUpdateOperation(
  queue: SyncOperation[],
  taskId: string,
  payload: TaskUpdateInput,
): SyncOperation[] {
  const nextQueue = [...queue];

  const createIndex = nextQueue.findIndex(
    operation => operation.type === 'create' && operation.localId === taskId,
  );

  if (createIndex >= 0) {
    const currentCreateOperation = nextQueue[createIndex];

    if (currentCreateOperation.type === 'create') {
      nextQueue[createIndex] = {
        ...currentCreateOperation,
        payload: {
          ...currentCreateOperation.payload,
          ...payload,
          status: payload.status ?? currentCreateOperation.payload.status,
        },
      };
    }

    return nextQueue;
  }

  const updateIndex = nextQueue.findIndex(
    operation => operation.type === 'update' && operation.taskId === taskId,
  );

  if (updateIndex >= 0) {
    const currentUpdateOperation = nextQueue[updateIndex];

    if (currentUpdateOperation.type === 'update') {
      nextQueue[updateIndex] = {
        ...currentUpdateOperation,
        payload: {
          ...currentUpdateOperation.payload,
          ...payload,
        },
      };
    }

    return nextQueue;
  }

  nextQueue.push({
    id: generateOperationId(),
    type: 'update',
    taskId,
    payload,
    createdAt: new Date().toISOString(),
  });

  return nextQueue;
}

function enqueueDeleteOperation(queue: SyncOperation[], taskId: string): SyncOperation[] {
  const hasPendingCreate = queue.some(
    operation => operation.type === 'create' && operation.localId === taskId,
  );

  const queueWithoutTaskOps = queue.filter(operation => {
    if (operation.type === 'create' && operation.localId === taskId) {
      return false;
    }

    if (operation.type === 'update' && operation.taskId === taskId) {
      return false;
    }

    if (operation.type === 'delete' && operation.taskId === taskId) {
      return false;
    }

    return true;
  });

  if (hasPendingCreate) {
    return queueWithoutTaskOps;
  }

  return [
    ...queueWithoutTaskOps,
    {
      id: generateOperationId(),
      type: 'delete',
      taskId,
      createdAt: new Date().toISOString(),
    },
  ];
}

function removeTaskFromState(tasks: Task[], taskId: string): Task[] {
  return sortTasks(tasks.filter(task => task.id !== taskId));
}

function patchTaskLocally(tasks: Task[], taskId: string, changes: TaskUpdateInput): Task[] {
  const now = new Date().toISOString();

  return sortTasks(
    tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            ...changes,
            updatedAt: now,
            synced: false,
          }
        : task,
    ),
  );
}

async function flushSyncQueue(
  tasks: Task[],
  queue: SyncOperation[],
): Promise<{ tasks: Task[]; queue: SyncOperation[]; syncedCount: number }> {
  if (!queue.length) {
    return {
      tasks,
      queue,
      syncedCount: 0,
    };
  }

  let nextTasks = [...tasks];
  const localIdMap = new Map<string, string>();

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const operation = queue[queueIndex];

    try {
      if (operation.type === 'create') {
        const createdTask = await createTodo(operation.payload);
        localIdMap.set(operation.localId, createdTask.id);

        let replacedLocalTask = false;
        nextTasks = nextTasks.map(task => {
          if (task.id !== operation.localId) {
            return task;
          }

          replacedLocalTask = true;
          return createdTask;
        });

        if (!replacedLocalTask) {
          nextTasks = upsertTask(nextTasks, createdTask);
        }
      }

      if (operation.type === 'update') {
        const resolvedTaskId = localIdMap.get(operation.taskId) ?? operation.taskId;

        const updatedTask = await updateTodo(resolvedTaskId, operation.payload);

        nextTasks = nextTasks.map(task => {
          if (task.id !== operation.taskId && task.id !== resolvedTaskId) {
            return task;
          }

          return updatedTask;
        });
      }

      if (operation.type === 'delete') {
        const resolvedTaskId = localIdMap.get(operation.taskId) ?? operation.taskId;

        await deleteTodo(resolvedTaskId);

        nextTasks = nextTasks.filter(task => task.id !== resolvedTaskId && task.id !== operation.taskId);
      }
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        return {
          tasks: sortTasks(nextTasks),
          queue: queue.slice(queueIndex),
          syncedCount: queueIndex,
        };
      }

      throw error;
    }
  }

  return {
    tasks: sortTasks(nextTasks),
    queue: [],
    syncedCount: queue.length,
  };
}

async function syncTasksState(currentState: PersistedTasksState): Promise<TasksSyncPayload> {
  const flushedState = await flushSyncQueue(currentState.tasks, currentState.queue);
  const latestRemoteTasks = await getTodos();

  const mergedTasks = mergeRemoteWithUnsynced(latestRemoteTasks, flushedState.tasks);
  const syncedAt = new Date().toISOString();

  await persistTasksState({
    tasks: mergedTasks,
    queue: flushedState.queue,
    lastSyncedAt: syncedAt,
  });

  return {
    tasks: mergedTasks,
    queue: flushedState.queue,
    lastSyncedAt: syncedAt,
    isOffline: false,
    infoMessage: flushedState.syncedCount > 0 ? 'store.tasks.offlineChangesSynced' : null,
  };
}

function normalizeErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'store.tasks.unexpectedError';
}

export const initializeTasks = createAsyncThunk<TasksSyncPayload, void, { state: SliceThunkState; rejectValue: string }>(
  'tasks/initialize',
  async (_, { rejectWithValue }) => {
    const persistedState = await loadPersistedTasksState();

    try {
      return await syncTasksState(persistedState);
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        return {
          ...persistedState,
          isOffline: true,
          infoMessage: persistedState.queue.length
            ? 'store.tasks.offlineModePendingAutoSync'
            : 'store.tasks.offlineModeShowingCached',
        };
      }

      return rejectWithValue(normalizeErrorMessage(error));
    }
  },
);

export const refreshTasks = createAsyncThunk<TasksSyncPayload, void, { state: SliceThunkState; rejectValue: string }>(
  'tasks/refresh',
  async (_, { getState, rejectWithValue }) => {
    const { tasks } = getState();

    const currentState: PersistedTasksState = {
      tasks: tasks.tasks,
      queue: tasks.queue,
      lastSyncedAt: tasks.lastSyncedAt,
    };

    try {
      return await syncTasksState(currentState);
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        await persistTasksState(currentState);

        return {
          ...currentState,
          isOffline: true,
          infoMessage: currentState.queue.length
            ? 'store.tasks.stillOfflinePendingSafe'
            : 'store.tasks.stillOfflineShowingLocal',
        };
      }

      return rejectWithValue(normalizeErrorMessage(error));
    }
  },
);

export const clearAllTasksData = createAsyncThunk<void, void, { rejectValue: string }>(
  'tasks/clearAllData',
  async (_, { rejectWithValue }) => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TASK_CACHE),
        AsyncStorage.removeItem(STORAGE_KEYS.TASK_SYNC_QUEUE),
        AsyncStorage.removeItem(STORAGE_KEYS.TASK_LAST_SYNCED_AT),
      ]);
      return;
    } catch {
      return rejectWithValue('store.tasks.unableClearLocalData');
    }
  },
);

export const createTask = createAsyncThunk<TasksSyncPayload, CreateTaskArgs, { state: SliceThunkState; rejectValue: string }>(
  'tasks/create',
  async (args, { getState, rejectWithValue }) => {
    const payload = trimTaskInput(args);
    const { tasks } = getState();

    try {
      const createdTask = await createTodo({
        ...payload,
        status: args.status ?? 'Pending',
      });

      const nextState: PersistedTasksState = {
        tasks: upsertTask(tasks.tasks, createdTask),
        queue: tasks.queue,
        lastSyncedAt: new Date().toISOString(),
      };

      await persistTasksState(nextState);

      return {
        ...nextState,
        isOffline: false,
        infoMessage: 'store.tasks.taskCreatedSuccess',
      };
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        const localTask = buildLocalTask({
          ...payload,
          status: args.status,
        });

        const nextState: PersistedTasksState = {
          tasks: upsertTask(tasks.tasks, localTask),
          queue: enqueueCreateOperation(tasks.queue, localTask),
          lastSyncedAt: tasks.lastSyncedAt,
        };

        await persistTasksState(nextState);

        return {
          ...nextState,
          isOffline: true,
          infoMessage: 'store.tasks.taskSavedOffline',
        };
      }

      return rejectWithValue(normalizeErrorMessage(error));
    }
  },
);

export const updateTask = createAsyncThunk<TasksSyncPayload, UpdateTaskArgs, { state: SliceThunkState; rejectValue: string }>(
  'tasks/update',
  async (args, { getState, rejectWithValue }) => {
    const cleanedChanges = trimTaskUpdateInput(args.changes);
    const { tasks } = getState();

    if (args.id.startsWith('local-')) {
      const nextState: PersistedTasksState = {
        tasks: patchTaskLocally(tasks.tasks, args.id, cleanedChanges),
        queue: enqueueUpdateOperation(tasks.queue, args.id, cleanedChanges),
        lastSyncedAt: tasks.lastSyncedAt,
      };

      await persistTasksState(nextState);

      return {
        ...nextState,
        isOffline: true,
        infoMessage: 'store.tasks.taskUpdatedLocal',
      };
    }

    try {
      const updatedTask = await updateTodo(args.id, cleanedChanges);

      const nextState: PersistedTasksState = {
        tasks: upsertTask(tasks.tasks, updatedTask),
        queue: tasks.queue,
        lastSyncedAt: new Date().toISOString(),
      };

      await persistTasksState(nextState);

      return {
        ...nextState,
        isOffline: false,
        infoMessage: 'store.tasks.taskUpdatedSuccess',
      };
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        const nextState: PersistedTasksState = {
          tasks: patchTaskLocally(tasks.tasks, args.id, cleanedChanges),
          queue: enqueueUpdateOperation(tasks.queue, args.id, cleanedChanges),
          lastSyncedAt: tasks.lastSyncedAt,
        };

        await persistTasksState(nextState);

        return {
          ...nextState,
          isOffline: true,
          infoMessage: 'store.tasks.taskUpdateQueued',
        };
      }

      return rejectWithValue(normalizeErrorMessage(error));
    }
  },
);

export const deleteTaskById = createAsyncThunk<TasksSyncPayload, DeleteTaskArgs, { state: SliceThunkState; rejectValue: string }>(
  'tasks/delete',
  async (args, { getState, rejectWithValue }) => {
    const { tasks } = getState();

    if (args.id.startsWith('local-')) {
      const nextState: PersistedTasksState = {
        tasks: removeTaskFromState(tasks.tasks, args.id),
        queue: enqueueDeleteOperation(tasks.queue, args.id),
        lastSyncedAt: tasks.lastSyncedAt,
      };

      await persistTasksState(nextState);

      return {
        ...nextState,
        isOffline: tasks.isOffline,
        infoMessage: 'store.tasks.localTaskDeleted',
      };
    }

    try {
      await deleteTodo(args.id);

      const nextState: PersistedTasksState = {
        tasks: removeTaskFromState(tasks.tasks, args.id),
        queue: tasks.queue,
        lastSyncedAt: new Date().toISOString(),
      };

      await persistTasksState(nextState);

      return {
        ...nextState,
        isOffline: false,
        infoMessage: 'store.tasks.taskDeletedSuccess',
      };
    } catch (error) {
      if (isApiError(error) && error.isNetworkError) {
        const nextState: PersistedTasksState = {
          tasks: removeTaskFromState(tasks.tasks, args.id),
          queue: enqueueDeleteOperation(tasks.queue, args.id),
          lastSyncedAt: tasks.lastSyncedAt,
        };

        await persistTasksState(nextState);

        return {
          ...nextState,
          isOffline: true,
          infoMessage: 'store.tasks.taskDeleteQueued',
        };
      }

      return rejectWithValue(normalizeErrorMessage(error));
    }
  },
);

function applySyncPayload(state: TasksState, action: PayloadAction<TasksSyncPayload>): void {
  state.tasks = action.payload.tasks;
  state.queue = action.payload.queue;
  state.lastSyncedAt = action.payload.lastSyncedAt;
  state.isOffline = action.payload.isOffline;
  state.infoMessage = action.payload.infoMessage;
  state.error = null;
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearInfoMessage(state) {
      state.infoMessage = null;
    },
    clearErrorMessage(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeTasks.fulfilled, (state, action) => {
        applySyncPayload(state, action);
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeTasks.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedLoad';
      })
      .addCase(refreshTasks.pending, state => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshTasks.fulfilled, (state, action) => {
        applySyncPayload(state, action);
        state.refreshing = false;
      })
      .addCase(refreshTasks.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedRefresh';
      })
      .addCase(clearAllTasksData.pending, state => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(clearAllTasksData.fulfilled, state => {
        resetTasksSliceState(state);
      })
      .addCase(clearAllTasksData.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedClear';
      })
      .addCase(createTask.pending, state => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        applySyncPayload(state, action);
        state.mutating = false;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedCreate';
      })
      .addCase(updateTask.pending, state => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        applySyncPayload(state, action);
        state.mutating = false;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedUpdate';
      })
      .addCase(deleteTaskById.pending, state => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deleteTaskById.fulfilled, (state, action) => {
        applySyncPayload(state, action);
        state.mutating = false;
      })
      .addCase(deleteTaskById.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload ?? action.error.message ?? 'store.tasks.failedDelete';
      });
  },
});

export const { clearInfoMessage, clearErrorMessage } = tasksSlice.actions;

export default tasksSlice.reducer;
