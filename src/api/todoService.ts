import { axiosInstance } from './axiosInstance';
import {
  type Task,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  type TaskUpdateInput,
} from '../types/task';

interface ApiTodo {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

function normalizePriority(value: string | undefined): TaskPriority {
  if (!value) {
    return 'Low';
  }

  const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return TASK_PRIORITIES.indexOf(normalized as TaskPriority) !== -1
    ? (normalized as TaskPriority)
    : 'Low';
}

function normalizeStatus(value: string | undefined): TaskStatus {
  if (!value) {
    return 'Pending';
  }

  const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return TASK_STATUSES.indexOf(normalized as TaskStatus) !== -1
    ? (normalized as TaskStatus)
    : 'Pending';
}

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const monthValue = date.getMonth() + 1;
  const dayValue = date.getDate();
  const month = monthValue < 10 ? `0${monthValue}` : String(monthValue);
  const day = dayValue < 10 ? `0${dayValue}` : String(dayValue);

  return `${year}-${month}-${day}`;
}

function normalizeDueDate(value: string | undefined, fallbackIso: string): string {
  const normalized = value?.trim();

  if (normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  if (normalized) {
    const parsedInputDate = new Date(normalized);

    if (!isNaN(parsedInputDate.getTime())) {
      return toLocalDateInputValue(parsedInputDate);
    }
  }

  const fallbackDate = new Date(fallbackIso);

  if (isNaN(fallbackDate.getTime())) {
    return toLocalDateInputValue(new Date());
  }

  return toLocalDateInputValue(fallbackDate);
}

function normalizeTask(apiTodo: ApiTodo): Task {
  const createdAt = apiTodo.createdAt ?? new Date().toISOString();
  const updatedAt = apiTodo.updatedAt ?? createdAt;

  return {
    id: apiTodo.id,
    title: apiTodo.title?.trim() ?? 'Untitled task',
    description: apiTodo.description?.trim() ?? '',
    dueDate: normalizeDueDate(apiTodo.dueDate, createdAt),
    priority: normalizePriority(apiTodo.priority),
    status: normalizeStatus(apiTodo.status),
    createdAt,
    updatedAt,
    synced: true,
  };
}

function buildApiPayload(payload: TaskInput & { status?: TaskStatus } | TaskUpdateInput): Record<string, string> {
  const data: Record<string, string> = {};

  if ('title' in payload && payload.title !== undefined) {
    data.title = payload.title.trim();
  }

  if ('description' in payload && payload.description !== undefined) {
    data.description = payload.description.trim();
  }

  if ('dueDate' in payload && payload.dueDate !== undefined) {
    data.dueDate = payload.dueDate.trim();
  }

  if ('priority' in payload && payload.priority !== undefined) {
    data.priority = payload.priority;
  }

  if ('status' in payload && payload.status !== undefined) {
    data.status = payload.status;
  }

  return data;
}

export function getTodos(): Promise<Task[]> {
  return axiosInstance
    .get<ApiTodo[]>('/todo')
    .then(response => response.data.map(normalizeTask));
}

export function getTodoById(id: string): Promise<Task> {
  return axiosInstance
    .get<ApiTodo>(`/todo/${id}`)
    .then(response => normalizeTask(response.data));
}

export function createTodo(payload: TaskInput & { status: TaskStatus }): Promise<Task> {
  return axiosInstance
    .post<ApiTodo>('/todo', buildApiPayload(payload))
    .then(response => normalizeTask(response.data));
}

export function updateTodo(id: string, payload: TaskUpdateInput): Promise<Task> {
  return axiosInstance
    .put<ApiTodo>(`/todo/${id}`, buildApiPayload(payload))
    .then(response => normalizeTask(response.data));
}

export function deleteTodo(id: string): Promise<void> {
  return axiosInstance.delete(`/todo/${id}`).then(() => undefined);
}
