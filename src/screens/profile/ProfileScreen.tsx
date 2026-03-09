import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenContainer from '../../components/ScreenContainer';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCurrentUser, selectSessionState, selectTaskMetrics, selectTasksState } from '../../store/selectors';
import { signOutSession, updateSessionName } from '../../store/sessionSlice';
import { clearAllTasksData, refreshTasks } from '../../store/tasksSlice';
import { formatSyncTime } from '../../utils/dateTime';
import { showToast } from '../../utils/toast';

const ProfileScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Profile'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();

  const { queue, lastSyncedAt, refreshing, isOffline } = useAppSelector(selectTasksState);
  const { totalCount, completedCount } = useAppSelector(selectTaskMetrics);
  const currentUser = useAppSelector(selectCurrentUser);
  const { saving } = useAppSelector(selectSessionState);

  const displayName = currentUser?.fullName ?? 'Medical Professional';
  const userEmail = currentUser?.email ?? 'No email on file';

  const [draftName, setDraftName] = useState(displayName);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setDraftName(displayName);
  }, [displayName]);

  const avatarInitial = useMemo(
    () => displayName.trim().charAt(0).toUpperCase() || 'M',
    [displayName],
  );

  const handleManualSync = async () => {
    const resultAction = await dispatch(refreshTasks());

    if (refreshTasks.fulfilled.match(resultAction) && resultAction.payload.infoMessage) {
      showToast(resultAction.payload.infoMessage);
      return;
    }

    if (refreshTasks.rejected.match(resultAction)) {
      showToast(resultAction.payload ?? 'Sync failed');
      return;
    }

    showToast('Sync completed.');
  };

  const handleSaveName = async () => {
    const normalizedName = draftName.trim().replace(/\s+/g, ' ');

    if (normalizedName === displayName) {
      setIsEditingName(false);
      return;
    }

    const resultAction = await dispatch(updateSessionName(normalizedName));

    if (updateSessionName.rejected.match(resultAction)) {
      showToast(resultAction.payload ?? 'Unable to update your display name.');
      return;
    }

    showToast('Display name updated.');
    setIsEditingName(false);
  };

  const performSignOut = async () => {
    const clearTasksAction = await dispatch(clearAllTasksData());
    const signOutAction = await dispatch(signOutSession());

    if (signOutSession.rejected.match(signOutAction)) {
      showToast(signOutAction.payload ?? 'Sign out failed. Please try again.');
      return;
    }

    if (clearAllTasksData.rejected.match(clearTasksAction)) {
      showToast('Signed out. Local task cache was not fully cleared.');
    }

    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

    if (!rootNavigation) {
      showToast('Navigation is not ready.');
      return;
    }

    rootNavigation.replace('Auth');
    showToast('Signed out successfully.');
  };

  const handleSaveNamePress = () => {
    handleSaveName().catch(() => {
      showToast('Unable to update your display name.');
    });
  };

  const handleConfirmSignOut = () => {
    performSignOut().catch(() => {
      showToast('Sign out failed. Please try again.');
    });
  };

  const handleSignOutPress = () => {
    Alert.alert(
      'Sign out',
      'You will need to log in again to access MediTask Pro.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
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
          <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]}>Account</Text>
          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Display name</Text>

          {isEditingName ? (
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter your display name"
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
                  <Text style={[styles.secondaryActionText, { color: appTheme.colors.textPrimary }]}>Cancel</Text>
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
                    <Text style={styles.primaryActionText}>Save name</Text>
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
                <Text style={[styles.inlineEditText, { color: appTheme.colors.textPrimary }]}>Edit name</Text>
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
          <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]}>Productivity summary</Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Total tasks</Text>
            <Text style={[styles.value, { color: appTheme.colors.textPrimary }]}>{totalCount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Completed tasks</Text>
            <Text style={[styles.value, { color: appTheme.colors.success }]}>{completedCount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Pending sync changes</Text>
            <Text style={[styles.value, { color: appTheme.colors.warning }]}>{queue.length}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Network status</Text>
            <Text style={[styles.value, { color: isOffline ? appTheme.colors.warning : appTheme.colors.success }]}>
              {isOffline ? 'Offline' : 'Online'}
            </Text>
          </View>

          <Text style={[styles.label, { color: appTheme.colors.textSecondary }]}>Last sync</Text>
          <Text style={[styles.syncValue, { color: appTheme.colors.textPrimary }]}>{formatSyncTime(lastSyncedAt)}</Text>
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
          {refreshing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.syncButtonText}>Sync now</Text>
          )}
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
          <Text style={[styles.signOutLabel, { color: appTheme.colors.danger }]}>Sign out</Text>
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
