export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ['Pending', 'Completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskFilter = 'All' | TaskStatus;

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
}

export type TaskUpdateInput = Partial<Pick<Task, 'title' | 'description' | 'priority' | 'status'>>;

interface BaseSyncOperation {
  id: string;
  createdAt: string;
}

export interface CreateSyncOperation extends BaseSyncOperation {
  type: 'create';
  localId: string;
  payload: TaskInput & { status: TaskStatus };
}

export interface UpdateSyncOperation extends BaseSyncOperation {
  type: 'update';
  taskId: string;
  payload: TaskUpdateInput;
}

export interface DeleteSyncOperation extends BaseSyncOperation {
  type: 'delete';
  taskId: string;
}

export type SyncOperation = CreateSyncOperation | UpdateSyncOperation | DeleteSyncOperation;
