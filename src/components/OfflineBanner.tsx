import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';

interface OfflineBannerProps {
  queueCount: number;
}

const OfflineBanner = ({ queueCount }: OfflineBannerProps) => {
  const { appTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: appTheme.colors.primaryMuted,
          borderColor: appTheme.colors.warning,
          borderRadius: appTheme.radius.md,
        },
      ]}
    >
      <Text style={[styles.text, { color: appTheme.colors.textPrimary }]}>Offline mode active.</Text>
      <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>
        {queueCount ? `${queueCount} change(s) waiting to sync.` : 'Showing cached tasks.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default OfflineBanner;
