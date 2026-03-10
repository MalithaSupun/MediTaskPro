import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';

const OnboardingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

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
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>{t('common.appName')}</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>
          {t('onboarding.subtitle')}
        </Text>

        <View style={styles.bulletList}>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>
            - {t('onboarding.bulletFast')}
          </Text>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>
            - {t('onboarding.bulletOffline')}
          </Text>
          <Text style={[styles.bulletText, { color: appTheme.colors.textPrimary }]}>
            - {t('onboarding.bulletAnalytics')}
          </Text>
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
          <Text style={styles.ctaLabel}>{t('common.actions.getStarted')}</Text>
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
