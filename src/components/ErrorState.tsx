import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';

interface ErrorStateProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onActionPress: () => void;
}

const ErrorState = ({ title, subtitle, actionLabel, onActionPress }: ErrorStateProps) => {
  const { appTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: appTheme.radius.md,
          borderColor: appTheme.colors.danger,
          backgroundColor: appTheme.colors.card,
        },
      ]}
    >
      <Text style={[styles.title, { color: appTheme.colors.danger }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>{subtitle}</Text>
      <Pressable
        onPress={onActionPress}
        style={({ pressed }) => [
          styles.button,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.danger,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 18,
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
    marginBottom: 14,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ErrorState;
