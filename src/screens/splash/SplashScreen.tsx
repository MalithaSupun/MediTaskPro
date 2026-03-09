import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Splash'>>();
  const { appTheme } = useAppTheme();

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1600);

    return () => clearTimeout(timerId);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}> 
      <View
        style={[
          styles.logoCircle,
          {
            borderColor: appTheme.colors.primary,
            backgroundColor: appTheme.colors.primaryMuted,
          },
        ]}
      >
        <Text style={[styles.logoText, { color: appTheme.colors.primary }]}>M</Text>
      </View>
      <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>MediTask Pro</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Smart task workflow for medical professionals</Text>
      <ActivityIndicator size="large" color={appTheme.colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  loader: {
    marginTop: 4,
  },
});

export default SplashScreen;
