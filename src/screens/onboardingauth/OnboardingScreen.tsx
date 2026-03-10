import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { STORAGE_KEYS } from '../../constants/storage';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';
import { writeJsonValue } from '../../utils/storage';

const OnboardingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Onboarding'>>();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const handleGetStarted = async () => {
    try {
      await writeJsonValue(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    } catch {
      // If persisting fails, keep the flow moving and continue to auth.
    }

    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: appTheme.spacing.lg,
            paddingTop: appTheme.spacing.xl,
            paddingBottom: appTheme.spacing.lg,
          },
        ]}
      >
        <View style={styles.topSection}>
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
        </View>

        <View>
          <Pressable
            onPress={handleGetStarted}
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
          <Text style={[styles.footerHint, { color: appTheme.colors.textSecondary }]}>
            {t('splash.subtitle')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    gap: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  bulletList: {
    marginTop: 8,
    gap: 10,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default OnboardingScreen;
