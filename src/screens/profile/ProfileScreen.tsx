import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../../components/ScreenContainer';
import SegmentedControl from '../../components/SegmentedControl';
import { useAppTheme } from '../../hooks/useAppTheme';
import { APP_LANGUAGES, type AppLanguage } from '../../i18n/resources';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAppLanguage, setThemeMode, THEME_MODES, type ThemeMode } from '../../store/preferencesSlice';
import {
  selectCurrentUser,
  selectPreferencesState,
  selectSessionState,
  selectTaskMetrics,
  selectTasksState,
} from '../../store/selectors';
import { signOutSession, updateSessionName } from '../../store/sessionSlice';
import { clearAllTasksData, refreshTasks } from '../../store/tasksSlice';
import { formatSyncTime } from '../../utils/dateTime';
import { showToast } from '../../utils/toast';

const ProfileScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Profile'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const { queue, lastSyncedAt, refreshing, isOffline } = useAppSelector(selectTasksState);
  const { themeMode, language, saving: savingPreferences } = useAppSelector(selectPreferencesState);
  const { totalCount, completedCount } = useAppSelector(selectTaskMetrics);
  const currentUser = useAppSelector(selectCurrentUser);
  const { saving } = useAppSelector(selectSessionState);

  const displayName = currentUser?.fullName ?? t('common.misc.medicalProfessional');
  const userEmail = currentUser?.email ?? t('common.misc.noEmailOnFile');

  const [draftName, setDraftName] = useState(displayName);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setDraftName(displayName);
  }, [displayName]);

  const avatarInitial = useMemo(() => displayName.trim().charAt(0).toUpperCase() || 'M', [displayName]);

  const handleManualSync = async () => {
    const resultAction = await dispatch(refreshTasks());

    if (refreshTasks.fulfilled.match(resultAction) && resultAction.payload.infoMessage) {
      showToast(t(resultAction.payload.infoMessage, { defaultValue: resultAction.payload.infoMessage }));
      return;
    }

    if (refreshTasks.rejected.match(resultAction)) {
      showToast(t(resultAction.payload ?? 'messages.syncFailed', { defaultValue: t('messages.syncFailed') }));
      return;
    }

    showToast(t('messages.syncCompleted'));
  };

  const handleThemeModeChange = async (mode: ThemeMode) => {
    if (mode === themeMode) {
      return;
    }

    const resultAction = await dispatch(setThemeMode(mode));

    if (setThemeMode.rejected.match(resultAction)) {
      showToast(t(resultAction.payload ?? 'messages.themeUpdateFailed', { defaultValue: t('messages.themeUpdateFailed') }));
      return;
    }

    showToast(
      t('messages.themeUpdated', {
        mode: t(`common.theme.${mode}`),
      }),
    );
  };

  const handleLanguageChange = async (nextLanguage: AppLanguage) => {
    if (nextLanguage === language) {
      return;
    }

    const resultAction = await dispatch(setAppLanguage(nextLanguage));

    if (setAppLanguage.rejected.match(resultAction)) {
      showToast(
        t(resultAction.payload ?? 'messages.languageUpdateFailed', {
          defaultValue: t('messages.languageUpdateFailed'),
        }),
      );
      return;
    }

    showToast(
      t('messages.languageUpdated', {
        language: t(`common.language.${nextLanguage}`),
      }),
    );
  };

  const handleSaveName = async () => {
    const normalizedName = draftName.trim().replace(/\s+/g, ' ');

    if (normalizedName === displayName) {
      setIsEditingName(false);
      return;
    }

    const resultAction = await dispatch(updateSessionName(normalizedName));

    if (updateSessionName.rejected.match(resultAction)) {
      showToast(
        t(resultAction.payload ?? 'messages.displayNameUpdateFailed', {
          defaultValue: t('messages.displayNameUpdateFailed'),
        }),
      );
      return;
    }

    showToast(t('messages.displayNameUpdated'));
    setIsEditingName(false);
  };

  const performSignOut = async () => {
    const clearTasksAction = await dispatch(clearAllTasksData());
    const signOutAction = await dispatch(signOutSession());

    if (signOutSession.rejected.match(signOutAction)) {
      showToast(t(signOutAction.payload ?? 'messages.signOutFailed', { defaultValue: t('messages.signOutFailed') }));
      return;
    }

    if (clearAllTasksData.rejected.match(clearTasksAction)) {
      showToast(t('messages.signedOutCacheWarning'));
    }

    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

    if (!rootNavigation) {
      showToast(t('messages.navigationNotReady'));
      return;
    }

    rootNavigation.replace('Auth');
    showToast(t('messages.signedOutSuccess'));
  };

  const handleSaveNamePress = () => {
    handleSaveName().catch(() => {
      showToast(t('messages.displayNameUpdateFailed'));
    });
  };

  const handleThemeModePress = (mode: ThemeMode) => {
    handleThemeModeChange(mode).catch(() => {
      showToast(t('messages.themeUpdateFailed'));
    });
  };

  const handleLanguagePress = (nextLanguage: AppLanguage) => {
    handleLanguageChange(nextLanguage).catch(() => {
      showToast(t('messages.languageUpdateFailed'));
    });
  };

  const handleConfirmSignOut = () => {
    performSignOut().catch(() => {
      showToast(t('messages.signOutFailed'));
    });
  };

  const handleSignOutPress = () => {
    Alert.alert(
      t('alerts.signOutTitle'),
      t('alerts.signOutMessage'),
      [
        {
          text: t('common.actions.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.actions.signOut'),
          style: 'destructive',
          onPress: handleConfirmSignOut,
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <View
          style={[
            styles.profileHero,
            {
              borderRadius: appTheme.radius.lg,
              borderColor: appTheme.colors.border,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                borderRadius: appTheme.radius.pill,
                backgroundColor: appTheme.colors.primaryMuted,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: appTheme.colors.primary }]}>{avatarInitial}</Text>
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={[styles.title, { color: appTheme.colors.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              borderRadius: appTheme.radius.lg,
              borderColor: appTheme.colors.border,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]}>{t('profile.account')}</Text>
          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.displayName')}</Text>

          {isEditingName ? (
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder={t('common.placeholders.enterDisplayName')}
              placeholderTextColor={appTheme.colors.textSecondary}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleSaveNamePress}
              style={[
                styles.nameInput,
                {
                  borderRadius: appTheme.radius.md,
                  borderColor: appTheme.colors.border,
                  color: appTheme.colors.textPrimary,
                  backgroundColor: appTheme.colors.cardSecondary,
                },
              ]}
            />
          ) : (
            <Text style={[styles.nameValue, { color: appTheme.colors.textPrimary }]}>{displayName}</Text>
          )}

          <View style={styles.accountActions}>
            {isEditingName ? (
              <>
                <Pressable
                  onPress={() => {
                    setDraftName(displayName);
                    setIsEditingName(false);
                  }}
                  style={({ pressed }) => [
                    styles.secondaryActionButton,
                    {
                      borderRadius: appTheme.radius.pill,
                      borderColor: appTheme.colors.border,
                      backgroundColor: appTheme.colors.cardSecondary,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.secondaryActionText, { color: appTheme.colors.textPrimary }]}>
                    {t('common.actions.cancel')}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={saving}
                  onPress={handleSaveNamePress}
                  style={({ pressed }) => [
                    styles.primaryActionButton,
                    {
                      borderRadius: appTheme.radius.pill,
                      backgroundColor: appTheme.colors.primary,
                      opacity: pressed || saving ? 0.86 : 1,
                    },
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionText}>{t('common.actions.saveName')}</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => setIsEditingName(true)}
                style={({ pressed }) => [
                  styles.inlineEditButton,
                  {
                    borderRadius: appTheme.radius.pill,
                    backgroundColor: appTheme.colors.cardSecondary,
                    opacity: pressed ? 0.86 : 1,
                  },
                ]}
              >
                <Text style={[styles.inlineEditText, { color: appTheme.colors.textPrimary }]}>
                  {t('common.actions.editName')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              borderRadius: appTheme.radius.lg,
              borderColor: appTheme.colors.border,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]}>{t('profile.appearance')}</Text>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.themeMode')}</Text>
          <SegmentedControl
            options={THEME_MODES}
            value={themeMode}
            onChange={handleThemeModePress}
            getLabel={mode => t(`common.theme.${mode}`)}
          />

          <View style={styles.themeStatusRow}>
            <Text style={[styles.themeStatusText, { color: appTheme.colors.textSecondary }]}> 
              {t('common.labels.currentMode')}: {t(`common.theme.${themeMode}`)}
            </Text>
            {savingPreferences ? <ActivityIndicator size="small" color={appTheme.colors.primary} /> : null}
          </View>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }, styles.languageLabel]}>
            {t('common.labels.language')}
          </Text>
          <SegmentedControl
            options={APP_LANGUAGES}
            value={language}
            onChange={handleLanguagePress}
            getLabel={lang => t(`common.language.${lang}`)}
          />
        </View>

        <View
          style={[
            styles.card,
            {
              borderRadius: appTheme.radius.lg,
              borderColor: appTheme.colors.border,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]}>{t('profile.productivitySummary')}</Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.totalTasks')}</Text>
            <Text style={[styles.value, { color: appTheme.colors.textPrimary }]}>{totalCount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.completedTasks')}</Text>
            <Text style={[styles.value, { color: appTheme.colors.success }]}>{completedCount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.pendingSyncChanges')}</Text>
            <Text style={[styles.value, { color: appTheme.colors.warning }]}>{queue.length}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.networkStatus')}</Text>
            <Text style={[styles.value, { color: isOffline ? appTheme.colors.warning : appTheme.colors.success }]}> 
              {isOffline ? t('common.network.offline') : t('common.network.online')}
            </Text>
          </View>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>{t('common.labels.lastSync')}</Text>
          <Text style={[styles.syncValue, { color: appTheme.colors.textPrimary }]}> 
            {formatSyncTime(lastSyncedAt, t('common.misc.notSyncedYet'))}
          </Text>
        </View>

        <Pressable
          onPress={handleManualSync}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.syncButton,
            {
              borderRadius: appTheme.radius.pill,
              backgroundColor: appTheme.colors.primary,
              opacity: pressed || refreshing ? 0.86 : 1,
            },
          ]}
        >
          {refreshing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.syncButtonText}>{t('common.actions.syncNow')}</Text>}
        </Pressable>

        <Pressable
          onPress={handleSignOutPress}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              borderRadius: appTheme.radius.pill,
              borderColor: appTheme.colors.danger,
              backgroundColor: appTheme.colors.card,
              opacity: pressed ? 0.84 : 1,
            },
          ]}
        >
          <Text style={[styles.signOutLabel, { color: appTheme.colors.danger }]}>{t('common.actions.signOut')}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  profileHero: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  nameValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  accountActions: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryActionButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryActionButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inlineEditButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineEditText: {
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  themeStatusRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  languageLabel: {
    marginTop: 14,
  },
  syncValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  syncButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  signOutButton: {
    minHeight: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
