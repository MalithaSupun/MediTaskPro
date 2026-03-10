import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

const EmptyState = ({ title, subtitle }: EmptyStateProps) => {
  const { appTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: appTheme.radius.md,
          borderColor: appTheme.colors.border,
          backgroundColor: appTheme.colors.card,
        },
      ]}
    >
      <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
