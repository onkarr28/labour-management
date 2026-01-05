import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Users, Wallet, TrendingUp } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import SummaryCard from '../components/SummaryCard';
import QuickActionButton from '../components/QuickActionButton';
import { getTodayString, getWeekStart } from '../utils/dateHelpers';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateWeekSummary,
} from '../utils/calculations';

const DashboardScreen = ({ navigation }) => {
  const { state } = useLabour();
  const { labours, contractorProfile } = state;

  const dashboardData = useMemo(() => {
    const today = getTodayString();
    const weekStart = getWeekStart();

    let presentToday = 0;
    let weeklyAdvances = 0;
    let weeklyPayout = 0;

    labours.forEach((labour) => {
      // Count present today
      if (labour.attendance && labour.attendance[today]) {
        if (labour.attendance[today].status === 'present') {
          presentToday++;
        }
      }

      // Calculate weekly summary
      const weekSummary = calculateWeekSummary(labour, weekStart);
      weeklyAdvances += weekSummary.weekAdvances;
      weeklyPayout += weekSummary.netPay;
    });

    return {
      presentToday,
      weeklyAdvances,
      weeklyPayout,
      totalWorkers: labours.length,
    };
  }, [labours]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {contractorProfile.name}! 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <SummaryCard
            title="Present Today"
            value={dashboardData.presentToday}
            subtitle={`of ${dashboardData.totalWorkers} workers`}
            icon={Users}
            color="primary"
          />

          <SummaryCard
            title="Weekly Payout"
            value={`₹${dashboardData.weeklyPayout}`}
            subtitle="Net amount to pay"
            icon={Wallet}
            color="mint"
          />

          <SummaryCard
            title="Advances This Week"
            value={`₹${dashboardData.weeklyAdvances}`}
            subtitle="Total advances given"
            icon={TrendingUp}
            color="blue"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionButton
            title="Add New Labour"
            onPress={() => navigation.navigate('AddLabour')}
            variant="primary"
          />
          <QuickActionButton
            title="Mark Today's Attendance"
            onPress={() => navigation.navigate('LabourList')}
            variant="mint"
          />
          <QuickActionButton
            title="View Weekly Report"
            onPress={() => navigation.navigate('WeeklyReport')}
            variant="blue"
          />
        </View>

        {/* Empty State */}
        {dashboardData.totalWorkers === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No workers added yet. Add your first worker to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: colors.primary.blue,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
