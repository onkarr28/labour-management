import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import WeeklySummaryCard from '../components/WeeklySummaryCard';
import { getWeekStart } from '../utils/dateHelpers';
import { calculateWeekSummary } from '../utils/calculations';

const WeeklyReportScreen = ({ navigation }) => {
  const { state, refreshData } = useLabour();
  const weekStart = getWeekStart();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh disabled to prevent interference with user input
  // Use pull-to-refresh instead

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const weeklyData = useMemo(() => {
    let totalWorkers = 0;
    let totalPayout = 0;
    let totalAdvances = 0;
    let totalPayments = 0;
    let totalRepayments = 0;
    let workerBreakdown = [];

    state.labours.forEach((labour) => {
      const summary = calculateWeekSummary(labour, weekStart);
      if (summary.presentDays > 0 || summary.weekAdvances > 0 || summary.weekPayments > 0 || summary.weekRepayments > 0) {
        totalWorkers++;
        totalPayout += summary.netPay;
        totalAdvances += summary.weekAdvances;
        totalPayments += summary.weekPayments;
        totalRepayments += summary.weekRepayments || 0;
        workerBreakdown.push({
          ...labour,
          ...summary,
        });
      }
    });

    return {
      totalWorkers,
      totalPayout,
      totalAdvances,
      totalPayments,
      totalRepayments,
      netCashRequired: totalPayout,
      workerBreakdown,
    };
  }, [state.labours, weekStart, refreshKey]);

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const formatDateRange = () => {
    return `${weekStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${weekEndDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  };

  const renderWorkerRow = ({ item }) => (
    <View style={[styles.tableRow, theme.shadows.soft]}>
      <View style={styles.tableCell}>
        <Text style={styles.workerName}>{item.name}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableValue}>{item.presentDays % 1 === 0 ? item.presentDays : item.presentDays.toFixed(1)}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableValue}>₹{item.earned}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableValue}>₹{item.weekAdvances}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableValue}>₹{item.weekPayments || 0}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.tableValue, styles.netPayValue]}>
          ₹{item.netPay}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.mint}
            colors={[colors.primary.mint]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Report</Text>
          <Text style={styles.dateRange}>{formatDateRange()}</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <WeeklySummaryCard
            label="Active Workers"
            value={weeklyData.totalWorkers}
            color="primary"
          />
          <WeeklySummaryCard
            label="Total Payout Required"
            value={`₹${weeklyData.totalPayout}`}
            color="success"
          />
          <WeeklySummaryCard
            label="Total Advances Given"
            value={`₹${weeklyData.totalAdvances}`}
            color="warning"
          />
          <WeeklySummaryCard
            label="Already Paid"
            value={`₹${weeklyData.totalPayments}`}
            color="mint"
          />
        </View>

        {/* Worker Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker Breakdown</Text>

          {weeklyData.workerBreakdown.length > 0 ? (
            <>
              {/* Table Header */}
              <View style={[styles.tableHeader, theme.shadows.soft]}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Name</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Days</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Earned</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Adv.</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Paid</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Due</Text>
                </View>
              </View>

              {/* Table Rows */}
              <FlatList
                data={weeklyData.workerBreakdown}
                keyExtractor={(item) => item.id}
                renderItem={renderWorkerRow}
                scrollEnabled={false}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No workers with attendance this week
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  dateRange: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary.blue,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tableHeaderCell: {
    flex: 1,
  },
  tableHeaderText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tableValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  netPayValue: {
    fontWeight: '600',
    color: colors.success,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  checklistCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  checkmark: {
    fontSize: 20,
    color: colors.success,
    marginRight: theme.spacing.md,
    fontWeight: 'bold',
  },
  checklistText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
});

export default WeeklyReportScreen;
