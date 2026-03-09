import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import OfflineBanner from '../../components/OfflineBanner';
import ScreenContainer from '../../components/ScreenContainer';
import SegmentedControl from '../../components/SegmentedControl';
import TaskCard from '../../components/TaskCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { TaskStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTasksState, selectVisibleTasks } from '../../store/selectors';
import {
  clearErrorMessage,
  clearInfoMessage,
  deleteTaskById,
  initializeTasks,
  refreshTasks,
} from '../../store/tasksSlice';
import type { TaskFilter } from '../../types/task';
import { showToast } from '../../utils/toast';

const FILTER_OPTIONS: readonly TaskFilter[] = ['All', 'Pending', 'Completed'];

const TaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TaskStackParamList, 'TaskList'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();

  const { loading, refreshing, error, infoMessage, initialized, isOffline, queue, mutating } =
    useAppSelector(selectTasksState);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskFilter>('All');

  const visibleTasks = useAppSelector(state => selectVisibleTasks(state, searchQuery, statusFilter));

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeTasks());
    }
  }, [dispatch, initialized]);

  useEffect(() => {
    if (!infoMessage) {
      return;
    }

    showToast(infoMessage);
    dispatch(clearInfoMessage());
  }, [dispatch, infoMessage]);

  const handleRetry = () => {
    dispatch(clearErrorMessage());
    dispatch(refreshTasks());
  };

  const handleDelete = (taskId: string) => {
    Alert.alert('Delete task', 'This task will be removed from your list.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteTaskById({ id: taskId }));
        },
      },
    ]);
  };

  const emptyStateTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return 'No tasks match your search';
    }

    if (statusFilter !== 'All') {
      return `No ${statusFilter.toLowerCase()} tasks available`;
    }

    return 'No tasks yet';
  }, [searchQuery, statusFilter]);

  const renderDeleteAction = (taskId: string) => {
    return (
      <Pressable
        onPress={() => handleDelete(taskId)}
        style={({ pressed }) => [
          styles.deleteAction,
          {
            backgroundColor: appTheme.colors.danger,
            borderRadius: appTheme.radius.md,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    );
  };

  if (loading && !initialized) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={[styles.centerLabel, { color: appTheme.colors.textSecondary }]}>Loading tasks...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: appTheme.colors.textPrimary }]}>Task Manager</Text>
          <Pressable
            onPress={() => navigation.navigate('CreateTask')}
            style={({ pressed }) => [
              styles.addButton,
              {
                borderRadius: appTheme.radius.pill,
                backgroundColor: appTheme.colors.primary,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search title or description"
          placeholderTextColor={appTheme.colors.textSecondary}
          style={[
            styles.searchInput,
            {
              color: appTheme.colors.textPrimary,
              borderColor: appTheme.colors.border,
              borderRadius: appTheme.radius.md,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        />

        <SegmentedControl options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />

        {isOffline ? <OfflineBanner queueCount={queue.length} /> : null}

        {error && !visibleTasks.length ? (
          <ErrorState
            title="Could not load tasks"
            subtitle={error}
            actionLabel="Retry"
            onActionPress={handleRetry}
          />
        ) : (
          <FlatList
            data={visibleTasks}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => dispatch(refreshTasks())}
                tintColor={appTheme.colors.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <Swipeable renderRightActions={() => renderDeleteAction(item.id)}>
                <TaskCard task={item} onPress={taskId => navigation.navigate('TaskDetail', { id: taskId })} />
              </Swipeable>
            )}
            ListEmptyComponent={
              <EmptyState
                title={emptyStateTitle}
                subtitle="Create a new medical task and keep your workflow organized."
              />
            }
          />
        )}
      </View>

      {mutating ? (
        <View style={styles.bottomLoaderContainer}>
          <ActivityIndicator size="small" color={appTheme.colors.primary} />
          <Text style={[styles.bottomLoaderText, { color: appTheme.colors.textSecondary }]}>Saving changes...</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('CreateTask')}
        style={({ pressed }) => [
          styles.fab,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    marginTop: 10,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  addButton: {
    minHeight: 38,
    minWidth: 74,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  listContainer: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  deleteAction: {
    width: 92,
    height: '90%',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomLoaderContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  bottomLoaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 28,
    marginTop: -2,
    fontWeight: '400',
  },
});

export default TaskListScreen;
