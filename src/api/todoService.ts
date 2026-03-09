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

  return TASK_PRIORITIES.includes(normalized as TaskPriority)
    ? (normalized as TaskPriority)
    : 'Low';
}

function normalizeStatus(value: string | undefined): TaskStatus {
  if (!value) {
    return 'Pending';
  }

  const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  return TASK_STATUSES.includes(normalized as TaskStatus)
    ? (normalized as TaskStatus)
    : 'Pending';
}

function normalizeTask(apiTodo: ApiTodo): Task {
  const createdAt = apiTodo.createdAt ?? new Date().toISOString();
  const updatedAt = apiTodo.updatedAt ?? createdAt;

  return {
    id: apiTodo.id,
    title: apiTodo.title?.trim() ?? 'Untitled task',
    description: apiTodo.description?.trim() ?? '',
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

  if ('priority' in payload && payload.priority !== undefined) {
    data.priority = payload.priority;
  }

  if ('status' in payload && payload.status !== undefined) {
    data.status = payload.status;
  }

  return data;
}

export async function getTodos(): Promise<Task[]> {
  const response = await axiosInstance.get<ApiTodo[]>('/todo');
  return response.data.map(normalizeTask);
}

export async function getTodoById(id: string): Promise<Task> {
  const response = await axiosInstance.get<ApiTodo>(`/todo/${id}`);
  return normalizeTask(response.data);
}

export async function createTodo(payload: TaskInput & { status: TaskStatus }): Promise<Task> {
  const response = await axiosInstance.post<ApiTodo>('/todo', buildApiPayload(payload));
  return normalizeTask(response.data);
}

export async function updateTodo(id: string, payload: TaskUpdateInput): Promise<Task> {
  const response = await axiosInstance.put<ApiTodo>(`/todo/${id}`, buildApiPayload(payload));
  return normalizeTask(response.data);
}

export async function deleteTodo(id: string): Promise<void> {
  await axiosInstance.delete(`/todo/${id}`);
}
