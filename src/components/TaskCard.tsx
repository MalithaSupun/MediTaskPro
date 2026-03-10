import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../hooks/useAppTheme';
import type { Task } from '../types/task';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
}

const TaskCard = ({ task, onPress }: TaskCardProps) => {
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(task.id)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: appTheme.colors.card,
          borderColor: appTheme.colors.border,
          borderRadius: appTheme.radius.md,
          opacity: pressed ? 0.92 : 1,
          shadowColor: appTheme.colors.shadow,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]} numberOfLines={2}>
          {task.title}
        </Text>
        {!task.synced ? (
          <Text style={[styles.offlineLabel, { color: appTheme.colors.warning }]}>
            {t('common.network.offline')}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.description, { color: appTheme.colors.textSecondary }]} numberOfLines={2}>
        {task.description || t('common.misc.noDescription')}
      </Text>

      <View style={styles.metaRow}>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  offlineLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TaskCard;
