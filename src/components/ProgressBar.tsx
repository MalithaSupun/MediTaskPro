import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../hooks/useAppTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

const ProgressBar = ({ progress, height = 10 }: ProgressBarProps) => {
  const { appTheme } = useAppTheme();
  const clampedProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: appTheme.colors.cardSecondary,
          borderRadius: appTheme.radius.pill,
        },
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: appTheme.colors.primary,
            borderRadius: appTheme.radius.pill,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});

export default ProgressBar;
