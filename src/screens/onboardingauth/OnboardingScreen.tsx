import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';

const OnboardingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();
  const { appTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}> 
      <View
        style={[
          styles.heroCard,
          {
            borderColor: appTheme.colors.border,
            borderRadius: appTheme.radius.lg,
            backgroundColor: appTheme.colors.card,
          },
        ]}
      >
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>MediTask Pro</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Manage priorities, reduce missed tasks, and track daily productivity.</Text>

        <View style={styles.bulletList}>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>- Fast task capture and editing</Text>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>- Offline-safe workflow with auto sync</Text>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>- Live dashboard and analytics</Text>
        </View>

        <Pressable
          onPress={() => navigation.replace('Auth')}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              borderRadius: appTheme.radius.pill,
              backgroundColor: appTheme.colors.primary,
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text style={styles.ctaLabel}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  heroCard: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  bulletList: {
    marginBottom: 18,
    gap: 8,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
