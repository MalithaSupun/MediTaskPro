import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from './index';
import { isSameLocalDay } from '../utils/dateTime';
import type { Task, TaskFilter } from '../types/task';

export const selectPreferencesState = (state: RootState) => state.preferences;
export const selectThemeMode = createSelector(
  selectPreferencesState,
  preferencesState => preferencesState.themeMode,
);

export const selectSessionState = (state: RootState) => state.session;
export const selectCurrentUser = createSelector(selectSessionState, sessionState => sessionState.user);

export const selectTasksState = (state: RootState) => state.tasks;

export const selectAllTasks = createSelector(selectTasksState, tasksState => tasksState.tasks);

export const selectTaskById = (taskId: string) =>
  createSelector(selectAllTasks, allTasks => allTasks.find(task => task.id === taskId));

export const selectTaskMetrics = createSelector(selectAllTasks, allTasks => {
  const totalCount = allTasks.length;
  const completedCount = allTasks.filter(task => task.status === 'Completed').length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    totalCount,
    completedCount,
    pendingCount,
    completionRate,
  };
});

export const selectPriorityMetrics = createSelector(selectAllTasks, allTasks => {
  const lowPriority = allTasks.filter(task => task.priority === 'Low').length;
  const mediumPriority = allTasks.filter(task => task.priority === 'Medium').length;
  const highPriority = allTasks.filter(task => task.priority === 'High').length;

  return {
    lowPriority,
    mediumPriority,
    highPriority,
  };
});

export const selectTodayTasks = createSelector(selectAllTasks, allTasks => {
  const today = new Date();

  return allTasks.filter(task => isSameLocalDay(task.createdAt, today));
});

export const selectVisibleTasks = createSelector(
  [selectAllTasks, (_: RootState, searchQuery: string) => searchQuery, (_: RootState, __: string, filter: TaskFilter) => filter],
  (allTasks, searchQuery, filter) => {
    const normalizedSearchTerm = searchQuery.trim().toLowerCase();

    return allTasks.filter(task => {
      const matchesSearch =
        !normalizedSearchTerm ||
        task.title.toLowerCase().includes(normalizedSearchTerm) ||
        task.description.toLowerCase().includes(normalizedSearchTerm);

      const matchesFilter = filter === 'All' ? true : task.status === filter;

      return matchesSearch && matchesFilter;
    });
  },
);

export function getTaskById(tasks: Task[], taskId: string): Task | undefined {
  return tasks.find(task => task.id === taskId);
}
