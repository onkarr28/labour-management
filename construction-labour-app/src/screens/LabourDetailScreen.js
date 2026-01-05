import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ChevronLeft, Trash2, Edit } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import AdvanceItem from '../components/AdvanceItem';
import QuickActionButton from '../components/QuickActionButton';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateNetPayable,
} from '../utils/calculations';
import { formatDateForDisplay } from '../utils/dateHelpers';

const LabourDetailScreen = ({ route, navigation }) => {
  const { labourId } = route.params;
  const { state, deleteLabour, deleteAdvance } = useLabour();
  const labour = state.labours.find((l) => l.id === labourId);

  if (!labour) {
    return (
      <View style={styles.container}>
        <Text>Worker not found</Text>
      </View>
    );
  }

  const summary = useMemo(() => {
    const presentDays = calculatePresentDays(labour.attendance);
    const earned = calculateEarned(presentDays, labour.dailyRate);
    const totalAdvances = calculateTotalAdvances(labour.advances);
    const netPayable = calculateNetPayable(earned, totalAdvances);

    return { presentDays, earned, totalAdvances, netPayable };
  }, [labour]);

  const handleDeleteLabour = () => {
    Alert.alert(
      'Delete Worker',
      'Are you sure you want to delete this worker?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            deleteLabour(labourId);
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Worker Details</Text>
          <TouchableOpacity onPress={handleDeleteLabour}>
            <Trash2 size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Worker Info Card */}
        <View style={[styles.infoCard, theme.shadows.soft]}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.workerName}>{labour.name}</Text>
              <Text style={styles.workerTrade}>{labour.trade}</Text>
            </View>
          </View>

          <View style={styles.infoDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{labour.mobile}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Daily Rate:</Text>
              <Text style={styles.infoValue}>₹{labour.dailyRate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Joined:</Text>
              <Text style={styles.infoValue}>
                {formatDateForDisplay(labour.joiningDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.blue }]}>
              <Text style={styles.summaryLabel}>Days Worked</Text>
              <Text style={styles.summaryValue}>{summary.presentDays}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.mint }]}>
              <Text style={styles.summaryLabel}>Amount Earned</Text>
              <Text style={styles.summaryValue}>₹{summary.earned}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.summaryLabel}>Total Advance</Text>
              <Text style={styles.summaryValue}>₹{summary.totalAdvances}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.success }]}>
              <Text style={styles.summaryLabel}>Net Payable</Text>
              <Text style={styles.summaryValue}>₹{summary.netPayable}</Text>
            </View>
          </View>
        </View>

        {/* Advances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advances</Text>
          {labour.advances && labour.advances.length > 0 ? (
            labour.advances.map((advance, index) => (
              <AdvanceItem key={index} advance={advance} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No advances recorded</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <QuickActionButton
            title="Mark Attendance"
            onPress={() =>
              navigation.navigate('AttendanceCalendar', { labourId })
            }
            variant="primary"
          />
          <QuickActionButton
            title="Record Advance"
            onPress={() =>
              navigation.navigate('AttendanceCalendar', { labourId })
            }
            variant="mint"
          />
          <QuickActionButton
            title="Settle Payment"
            onPress={() => {
              Alert.alert(
                'Payment',
                `Amount to pay: ₹${summary.netPayable}`,
                [{ text: 'OK', onPress: () => {} }]
              );
            }}
            variant="success"
          />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  workerName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  workerTrade: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  infoDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 100,
  },
});

export default LabourDetailScreen;
