import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';
import type { TaskPriority } from '../types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; lightColor: string; darkColor: string }> = {
  Low: {
    label: 'Low',
    lightColor: '#D9F8E6',
    darkColor: '#1F4D34',
  },
  Medium: {
    label: 'Medium',
    lightColor: '#FFE9C7',
    darkColor: '#5D3D11',
  },
  High: {
    label: 'High',
    lightColor: '#FFD6D1',
    darkColor: '#5A1F1A',
  },
};

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const { appTheme } = useAppTheme();
  const config = priorityConfig[priority];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appTheme.isDark ? config.darkColor : config.lightColor,
          borderRadius: appTheme.radius.pill,
        },
      ]}
    >
      <Text style={[styles.text, { color: appTheme.colors.textPrimary }]}>{config.label}</Text>
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

export default PriorityBadge;
