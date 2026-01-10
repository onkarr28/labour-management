import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { Users, Wallet, TrendingUp, LogOut } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import SummaryCard from '../components/SummaryCard';
import QuickActionButton from '../components/QuickActionButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getTodayString, getWeekStart } from '../utils/dateHelpers';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateWeekSummary,
} from '../utils/calculations';

const DashboardScreen = ({ navigation }) => {
  const { state, refreshData } = useLabour();
  const { labours, contractorProfile } = state;
  const { logout, user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  // All workers are visible to both contractors - no filtering needed
  const contractorWorkers = useMemo(() => {
    return labours;  // Show ALL workers to both contractors
  }, [labours, refreshKey]);

  const dashboardData = useMemo(() => {
    const today = getTodayString();
    const weekStart = getWeekStart();

    let presentToday = 0;
    let weeklyAdvances = 0;
    let weeklyPayout = 0;
    const workersBySite = {};

    contractorWorkers.forEach((labour) => {
      // Count present today and track site
      if (labour.attendance && labour.attendance[today]) {
        if (labour.attendance[today].status === 'present') {
          presentToday++;
          const sites = labour.attendance[today].sites || 
                       (labour.attendance[today].site ? [labour.attendance[today].site] : []);
          
          if (sites.length === 0) {
            const noSiteKey = 'No site assigned';
            if (!workersBySite[noSiteKey]) {
              workersBySite[noSiteKey] = [];
            }
            workersBySite[noSiteKey].push(labour.name);
          } else {
            sites.forEach(site => {
              if (!workersBySite[site]) {
                workersBySite[site] = [];
              }
              workersBySite[site].push(labour.name);
            });
          }
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
      totalWorkers: contractorWorkers.length,
      workersBySite,
    };
  }, [contractorWorkers, refreshKey]);

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
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              Hello, {user?.name}! 👋
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
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={colors.text.primary} />
          </TouchableOpacity>
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
            onPress={() => navigation.navigate('QuickAttendance')}
            variant="mint"
          />
          <QuickActionButton
            title="View Transactions"
            onPress={() => navigation.navigate('TransactionHistory')}
            variant="blue"
          />
          <QuickActionButton
            title="View Weekly Report"
            onPress={() => navigation.navigate('WeeklyReport')}
            variant="blue"
          />
        </View>

        {/* Workers by Site */}
        {dashboardData.presentToday > 0 && (
          <View style={styles.siteSection}>
            <Text style={styles.sectionTitle}>Today&apos;s Site Allocation</Text>
            {Object.entries(dashboardData.workersBySite).map(([site, workers]) => (
              <View key={site} style={[styles.siteCard, theme.shadows.soft]}>
                <Text style={styles.siteName}>{site}</Text>
                <View style={styles.workersList}>
                  {workers.map((worker, idx) => (
                    <View key={idx} style={styles.workerChip}>
                      <Text style={styles.workerChipText}>{worker}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {dashboardData.totalWorkers === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No workers added yet. Add your first worker to get started!
            </Text>
          </View>
)}
      </ScrollView>
      
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  logoutButton: {
    padding: theme.spacing.sm,
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
  siteSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  siteCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  siteName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  workersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  workerChip: {
    backgroundColor: colors.primary.mint,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  workerChipText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default DashboardScreen;
