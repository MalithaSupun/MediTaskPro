import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../components/EmptyState';
import ProgressBar from '../../components/ProgressBar';
import ScreenContainer from '../../components/ScreenContainer';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppSelector } from '../../store/hooks';
import {
  selectPriorityMetrics,
  selectTaskMetrics,
  selectTasksState,
} from '../../store/selectors';
import { formatSyncTime } from '../../utils/dateTime';

const AnalyticsScreen = () => {
  const { appTheme } = useAppTheme();

  const taskMetrics = useAppSelector(selectTaskMetrics);
  const priorityMetrics = useAppSelector(selectPriorityMetrics);
  const { queue, lastSyncedAt } = useAppSelector(selectTasksState);

  const totalTasks = taskMetrics.totalCount;

  const priorityData = useMemo(
    () => [
      { label: 'High', count: priorityMetrics.highPriority, color: '#D35C4A' },
      { label: 'Medium', count: priorityMetrics.mediumPriority, color: '#D38D2E' },
      { label: 'Low', count: priorityMetrics.lowPriority, color: '#2E9D6D' },
    ],
    [priorityMetrics.highPriority, priorityMetrics.lowPriority, priorityMetrics.mediumPriority],
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { padding: appTheme.spacing.lg }]}> 
        <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Productivity Analytics</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Track completion trends and workload balance.</Text>

        {!totalTasks ? (
          <EmptyState
            title="No data available yet"
            subtitle="Create tasks and mark them completed to generate analytics."
          />
        ) : (
          <>
            <View
              style={[
                styles.summaryCard,
                {
                  borderRadius: appTheme.radius.lg,
                  borderColor: appTheme.colors.border,
                  backgroundColor: appTheme.colors.card,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>Completion Progress</Text>
              <Text style={[styles.bigMetric, { color: appTheme.colors.primary }]}>{taskMetrics.completionRate}%</Text>
              <ProgressBar progress={taskMetrics.completionRate} height={12} />

              <View style={styles.metricRow}>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>Completed</Text>
                  <Text style={[styles.metricValue, { color: appTheme.colors.success }]}>{taskMetrics.completedCount}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>Pending</Text>
                  <Text style={[styles.metricValue, { color: appTheme.colors.warning }]}>{taskMetrics.pendingCount}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricLabel, { color: appTheme.colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.metricValue, { color: appTheme.colors.textPrimary }]}>{taskMetrics.totalCount}</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  borderRadius: appTheme.radius.lg,
                  borderColor: appTheme.colors.border,
                  backgroundColor: appTheme.colors.card,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>Priority Distribution</Text>

              {priorityData.map(item => {
                const percentage = totalTasks ? Math.round((item.count / totalTasks) * 100) : 0;

                return (
                  <View key={item.label} style={styles.priorityRow}>
                    <View style={styles.priorityHeaderRow}>
                      <Text style={[styles.priorityLabel, { color: appTheme.colors.textPrimary }]}> {item.label}</Text>
                      <Text style={[styles.priorityValue, { color: appTheme.colors.textSecondary }]}>
                        {item.count} ({percentage}%)
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityTrack,
                        {
                          backgroundColor: appTheme.colors.cardSecondary,
                          borderRadius: appTheme.radius.pill,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityFill,
                          {
                            backgroundColor: item.color,
                            width: `${percentage}%`,
                            borderRadius: appTheme.radius.pill,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View
          style={[
            styles.metaCard,
            {
              borderColor: appTheme.colors.border,
              borderRadius: appTheme.radius.md,
              backgroundColor: appTheme.colors.card,
            },
          ]}
        >
          <Text style={[styles.metaLabel, { color: appTheme.colors.textSecondary }]}>Last synced</Text>
          <Text style={[styles.metaValue, { color: appTheme.colors.textPrimary }]}>{formatSyncTime(lastSyncedAt)}</Text>
          <Text style={[styles.metaLabel, { color: appTheme.colors.textSecondary }]}>Pending sync changes</Text>
          <Text style={[styles.metaValue, { color: appTheme.colors.textPrimary }]}>{queue.length}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 34,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  summaryCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  bigMetric: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  metricRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricBox: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 21,
    fontWeight: '800',
  },
  priorityRow: {
    marginBottom: 12,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  priorityValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityTrack: {
    height: 10,
    width: '100%',
    overflow: 'hidden',
  },
  priorityFill: {
    height: '100%',
  },
  metaCard: {
    borderWidth: 1,
    padding: 14,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
});

export default AnalyticsScreen;
