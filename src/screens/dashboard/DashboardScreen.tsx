import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import EmptyState from '../../components/EmptyState';
import OfflineBanner from '../../components/OfflineBanner';
import ProgressBar from '../../components/ProgressBar';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { MainTabParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCurrentUser, selectTaskMetrics, selectTasksState, selectTodayTasks } from '../../store/selectors';
import { initializeTasks } from '../../store/tasksSlice';
import { getGreetingByTime } from '../../utils/dateTime';

const DashboardScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Dashboard'>>();
  const dispatch = useAppDispatch();
  const { appTheme } = useAppTheme();
  const { t } = useTranslation();

  const taskMetrics = useAppSelector(selectTaskMetrics);
  const todayTasks = useAppSelector(selectTodayTasks);
  const { loading, initialized, isOffline, queue } = useAppSelector(selectTasksState);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeTasks());
    }
  }, [dispatch, initialized]);

  const greeting = useMemo(() => {
    const displayName = currentUser?.fullName ?? t('common.misc.medicalProfessional');
    return `${t(`common.greetings.${getGreetingByTime(new Date())}`)}, ${displayName}`;
  }, [currentUser?.fullName, t]);

  if (loading && !initialized) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={appTheme.colors.primary} />
          <Text style={[styles.centerLabel, { color: appTheme.colors.textSecondary }]}>{t('dashboard.preparing')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <Text style={[styles.greeting, { color: appTheme.colors.textPrimary }]}>{greeting}</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>{t('dashboard.subtitle')}</Text>

        {isOffline ? <OfflineBanner queueCount={queue.length} /> : null}

        <View
          style={[
            styles.progressCard,
            {
              borderRadius: appTheme.radius.lg,
              borderColor: appTheme.colors.border,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.progressTitle, { color: appTheme.colors.textPrimary }]}>{t('dashboard.progressTitle')}</Text>
            <Text style={[styles.progressRate, { color: appTheme.colors.primary }]}>{taskMetrics.completionRate}%</Text>
          </View>
          <ProgressBar progress={taskMetrics.completionRate} height={12} />
          <View style={styles.metricRow}>
            <View>
              <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>{t('common.labels.completed')}</Text>
              <Text style={[styles.metricValue, { color: appTheme.colors.success }]}>{taskMetrics.completedCount}</Text>
            </View>
            <View>
              <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>{t('common.labels.pending')}</Text>
              <Text style={[styles.metricValue, { color: appTheme.colors.warning }]}>{taskMetrics.pendingCount}</Text>
            </View>
            <View>
              <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>{t('common.labels.total')}</Text>
              <Text style={[styles.metricValue, { color: appTheme.colors.textPrimary }]}>{taskMetrics.totalCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.todayHeader}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('dashboard.todayTasksTitle')}</Text>
          <Pressable
            onPress={() => navigation.navigate('Tasks', { screen: 'TaskList' })}
            style={({ pressed }) => [
              styles.linkButton,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.linkText, { color: appTheme.colors.primary }]}>{t('common.actions.viewAll')}</Text>
          </Pressable>
        </View>

        {todayTasks.length ? (
          todayTasks.slice(0, 4).map(task => (
            <Pressable
              key={task.id}
              onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { id: task.id } })}
              style={({ pressed }) => [
                styles.todayTaskCard,
                {
                  borderColor: appTheme.colors.border,
                  borderRadius: appTheme.radius.md,
                  backgroundColor: appTheme.colors.card,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <Text style={[styles.todayTaskTitle, { color: appTheme.colors.textPrimary }]} numberOfLines={1}>
                {task.title}
              </Text>
              <StatusBadge status={task.status} />
            </Pressable>
          ))
        ) : (
          <EmptyState
            title={t('dashboard.noTasksTodayTitle')}
            subtitle={t('dashboard.noTasksTodaySubtitle')}
          />
        )}
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('Tasks', { screen: 'CreateTask' })}
        style={({ pressed }) => [
          styles.fab,
          {
            borderRadius: appTheme.radius.pill,
            backgroundColor: appTheme.colors.primary,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    marginTop: 10,
    fontSize: 14,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressRate: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  linkButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  todayTaskCard: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    marginTop: -2,
  },
});

export default DashboardScreen;
