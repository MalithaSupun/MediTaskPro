import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../hooks/useAppTheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ScreenContainer = ({ children, style }: ScreenContainerProps) => {
  const { appTheme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: appTheme.colors.background }]}> 
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default ScreenContainer;
