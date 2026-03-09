import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTaskMetrics, selectTasksState } from '../../store/selectors';
import { refreshTasks } from '../../store/tasksSlice';
import { formatSyncTime } from '../../utils/dateTime';
import { showToast } from '../../utils/toast';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();

  const { queue, lastSyncedAt, refreshing, isOffline } = useAppSelector(selectTasksState);
  const { totalCount, completedCount } = useAppSelector(selectTaskMetrics);

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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Dr. Nimal</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Mobile productivity profile</Text>

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
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 14,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
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
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ProfileScreen;
