import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../hooks/useAppTheme';
import type { TaskStatus } from '../types/task';

interface StatusBadgeProps {
  status: TaskStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();
  const isCompleted = status === 'Completed';

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: appTheme.radius.pill,
          backgroundColor: isCompleted ? appTheme.colors.primaryMuted : appTheme.colors.cardSecondary,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isCompleted ? appTheme.colors.success : appTheme.colors.textSecondary,
          },
        ]}
      >
        {isCompleted ? t('common.status.completed') : t('common.status.pending')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StatusBadge;
