import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import PriorityBadge from '../../components/PriorityBadge';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { TaskStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getTaskById, selectTasksState } from '../../store/selectors';
import { deleteTaskById, updateTask } from '../../store/tasksSlice';
import { showToast } from '../../utils/toast';

const TaskDetailScreen = () => {
  const route = useRoute<RouteProp<TaskStackParamList, 'TaskDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<TaskStackParamList, 'TaskDetail'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const task = useAppSelector(state => getTaskById(state.tasks.tasks, route.params.id));
  const { mutating } = useAppSelector(selectTasksState);

  if (!task) {
    return (
      <ScreenContainer>
        <View style={styles.missingContainer}>
          <Text style={[styles.missingTitle, { color: appTheme.colors.textPrimary }]}>
            {t('tasks.detail.notFoundTitle')}
          </Text>
          <Text style={[styles.missingSubtitle, { color: appTheme.colors.textSecondary }]}>
            {t('tasks.detail.notFoundSubtitle')}
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                borderRadius: appTheme.radius.pill,
                backgroundColor: appTheme.colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.backButtonText}>{t('common.actions.goBack')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const nextStatus = task.status === 'Pending' ? 'Completed' : 'Pending';

  const handleToggleStatus = async () => {
    const resultAction = await dispatch(updateTask({ id: task.id, changes: { status: nextStatus } }));

    if (updateTask.fulfilled.match(resultAction) && resultAction.payload.infoMessage) {
      showToast(resultAction.payload.infoMessage);
    }

    if (updateTask.rejected.match(resultAction)) {
      showToast(
        t(resultAction.payload ?? 'messages.taskStatusUpdateFailed', {
          defaultValue: t('messages.taskStatusUpdateFailed'),
        }),
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(t('tasks.alerts.deleteTitle'), t('tasks.alerts.deleteFromDetailMessage'), [
      {
        text: t('common.actions.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.actions.delete'),
        style: 'destructive',
        onPress: async () => {
          const resultAction = await dispatch(deleteTaskById({ id: task.id }));

          if (deleteTaskById.fulfilled.match(resultAction)) {
            if (resultAction.payload.infoMessage) {
              showToast(resultAction.payload.infoMessage);
            }

            navigation.goBack();
            return;
          }

          if (deleteTaskById.rejected.match(resultAction)) {
            showToast(
              t(resultAction.payload ?? 'messages.taskDeleteFailed', {
                defaultValue: t('messages.taskDeleteFailed'),
              }),
            );
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <View
          style={[
            styles.card,
            {
              borderColor: appTheme.colors.border,
              borderRadius: appTheme.radius.lg,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <View style={styles.metaRow}>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </View>

          <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{task.title}</Text>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>
            {t('common.labels.description')}
          </Text>
          <Text style={[styles.description, { color: appTheme.colors.textPrimary }]}>
            {task.description || t('common.misc.noDescriptionProvided')}
          </Text>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.created')}</Text>
          <Text style={[styles.timestamp, { color: appTheme.colors.textPrimary }]}>
            {new Date(task.createdAt).toLocaleString()}
          </Text>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>
            {t('common.labels.lastUpdated')}
          </Text>
          <Text style={[styles.timestamp, { color: appTheme.colors.textPrimary }]}>
            {new Date(task.updatedAt).toLocaleString()}
          </Text>

          {!task.synced ? (
            <Text style={[styles.unsyncedText, { color: appTheme.colors.warning }]}>
              {t('tasks.detail.pendingSync')}
            </Text>
          ) : null}
        </View>

        <Pressable
          disabled={mutating}
          onPress={handleToggleStatus}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              borderRadius: appTheme.radius.pill,
              backgroundColor: appTheme.colors.primary,
              opacity: pressed || mutating ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {t('common.actions.markAs', {
              status: t(`common.status.${nextStatus.toLowerCase()}`),
            })}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('EditTask', { id: task.id })}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderRadius: appTheme.radius.pill,
              borderColor: appTheme.colors.primary,
              backgroundColor: appTheme.colors.card,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: appTheme.colors.primary }]}>
            {t('common.actions.editTask')}
          </Text>
        </Pressable>

        <Pressable
          disabled={mutating}
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            {
              borderRadius: appTheme.radius.pill,
              backgroundColor: appTheme.colors.danger,
              opacity: pressed || mutating ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.deleteButtonText}>{t('common.actions.deleteTask')}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  timestamp: {
    fontSize: 14,
    marginBottom: 10,
  },
  unsyncedText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  missingTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  missingSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default TaskDetailScreen;
