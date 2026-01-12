import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, Trash2, Edit } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import AdvanceItem from '../components/AdvanceItem';
import QuickActionButton from '../components/QuickActionButton';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateTotalPayments,
  calculateTotalRepayments,
  calculateNetBalance,
  calculateWeekSummary,
} from '../utils/calculations';
import { formatDateForDisplay, getTodayString, getWeekStart } from '../utils/dateHelpers';

const LabourDetailScreen = ({ route, navigation }) => {
  const { labourId } = route.params;
  const { state, deleteLabour, addAdvance, recordPayment, recordRepayment, refreshData } = useLabour();
  const { user } = useAuth();
  const labour = state.labours.find((l) => l.id === labourId);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentNote, setRepaymentNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle pull-to-refresh (no auto-refresh to allow uninterrupted input)
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

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
    const totalPaid = calculateTotalPayments(labour.payments);
    const totalRepayments = calculateTotalRepayments(labour.repayments);
    const netBalance = calculateNetBalance(earned, totalAdvances, totalPaid, totalRepayments);
    const weekStart = getWeekStart();
    const weeklySummary = calculateWeekSummary(labour, weekStart);

    return { presentDays, earned, totalAdvances, totalPaid, totalRepayments, netBalance, weeklySummary };
  }, [labour]);

  // Get site work history
  const siteHistory = useMemo(() => {
    if (!labour.attendance) return [];
    
    const history = [];
    Object.entries(labour.attendance).forEach(([date, record]) => {
      if (record.status === 'present' || record.status === 'half-day') {
        const sites = record.sites || (record.site ? [record.site] : []);
        if (sites.length > 0) {
          const dayLabel = record.status === 'half-day' ? ' (Half Day)' : '';
          history.push({
            date,
            sites: sites.join(' and ') + dayLabel,
            status: record.status,
          });
        }
      }
    });
    
    // Sort by date descending (most recent first)
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [labour.attendance]);

  const handleRecordAdvance = () => {
    const amount = parseInt(advanceAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addAdvance(labourId, {
      date: getTodayString(),
      amount,
      note: advanceNote,
      paidBy: user?.contractorId,
      contractorName: user?.name,
    });

    setAdvanceAmount('');
    setAdvanceNote('');
    setShowAdvanceModal(false);
    Alert.alert('Success', 'Advance recorded successfully!');
  };

  const handleRecordPayment = () => {
    const amount = parseInt(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const payment = {
      date: getTodayString(),
      amount,
      note: paymentNote,
      paidBy: user?.contractorId,
      contractorName: user?.name,
    };

    recordPayment({ labourId, payment });
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentModal(false);
    Alert.alert('Success', 'Payment recorded successfully!');
  };

  const handleRecordRepayment = () => {
    const amount = parseInt(repaymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const repayment = {
      date: getTodayString(),
      amount,
      note: repaymentNote,
      receivedBy: user?.contractorId,
      contractorName: user?.name,
    };

    recordRepayment(labourId, repayment);
    setRepaymentAmount('');
    setRepaymentNote('');
    setShowRepaymentModal(false);
    Alert.alert('Success', 'Repayment recorded successfully!');
  };

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
            {labour.loginId && labour.password && (
              <>
                <View style={styles.credentialsDivider} />
                <Text style={styles.credentialsTitle}>Login Credentials</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Login ID:</Text>
                  <Text style={styles.infoValue}>{labour.loginId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Password:</Text>
                  <Text style={styles.infoValue}>{labour.password}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.blue }]}>
              <Text style={styles.summaryLabel}>Days Worked</Text>
              <Text style={styles.summaryValue}>{summary.presentDays % 1 === 0 ? summary.presentDays : summary.presentDays.toFixed(1)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.mint }]}>
              <Text style={styles.summaryLabel}>Amount Earned</Text>
              <Text style={styles.summaryValue}>₹{summary.earned}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.warning }]}>
              <Text style={styles.summaryLabel}>Total Advance</Text>
              <Text style={styles.summaryValue}>₹{summary.totalAdvances}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary.pink }]}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>₹{summary.totalPaid}</Text>
            </View>
            {summary.totalRepayments > 0 && (
              <View style={[styles.summaryCard, { backgroundColor: colors.primary.blue }]}>
                <Text style={styles.summaryLabel}>Collected Back</Text>
                <Text style={styles.summaryValue}>₹{summary.totalRepayments}</Text>
              </View>
            )}
            <View style={[styles.summaryCard, { backgroundColor: summary.netBalance < 0 ? colors.error : colors.success }]}>
              <Text style={styles.summaryLabel}>Current Balance</Text>
              <Text style={styles.summaryValue}>₹{summary.netBalance}</Text>
            </View>
          </View>
        </View>

        {/* Weekly Breakdown */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>This Week's Breakdown</Text>
          <View style={[styles.weeklyBreakdown, theme.shadows.soft]}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Days Present:</Text>
              <Text style={styles.breakdownValue}>{summary.weeklySummary.presentDays % 1 === 0 ? summary.weeklySummary.presentDays : summary.weeklySummary.presentDays.toFixed(1)} days</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Amount Earned:</Text>
              <Text style={styles.breakdownValue}>₹{summary.weeklySummary.earned}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Advances Given:</Text>
              <Text style={styles.breakdownValue}>₹{summary.weeklySummary.weekAdvances}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Already Paid:</Text>
              <Text style={styles.breakdownValue}>₹{summary.weeklySummary.weekPayments || 0}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownRowHighlight]}>
              <Text style={styles.breakdownLabelHighlight}>Net to Pay:</Text>
              <Text style={styles.breakdownValueHighlight}>₹{summary.weeklySummary.netPay}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <QuickActionButton
            title="Check Attendance"
            onPress={() =>
              navigation.navigate('AttendanceCalendar', { labourId })
            }
            variant="primary"
          />
          <QuickActionButton
            title="Record Advance"
            onPress={() => setShowAdvanceModal(true)}
            variant="mint"
          />
          <QuickActionButton
            title="Record Payment"
            onPress={() => setShowPaymentModal(true)}
            variant="success"
          />
        </View>

        {/* Transaction History Section Header */}
        <View style={styles.transactionHeaderSection}>
          <Text style={styles.transactionHeaderTitle}>Transaction History</Text>
          <Text style={styles.transactionHeaderSubtitle}>All financial activities for this worker</Text>
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

        {/* Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments</Text>
          {labour.payments && labour.payments.length > 0 ? (
            labour.payments.map((payment, index) => (
              <AdvanceItem
                key={index}
                advance={payment}
                variant="payment"
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payments recorded</Text>
            </View>
          )}
        </View>

        {/* Repayments */}
        {labour.repayments && labour.repayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Money Collected Back</Text>
            {labour.repayments.map((repayment, index) => (
              <AdvanceItem
                key={index}
                advance={repayment}
                variant="repayment"
              />
            ))}
          </View>
        )}

        {/* Site Work History */}
        {siteHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Site Work History</Text>
            {siteHistory.map((record, index) => (
              <View key={index} style={[styles.siteHistoryCard, theme.shadows.soft]}>
                <View style={styles.siteHistoryDate}>
                  <Text style={styles.siteHistoryDateText}>
                    {formatDateForDisplay(record.date)}
                  </Text>
                </View>
                <View style={styles.siteHistoryLocation}>
                  <Text style={styles.siteHistoryLocationText}>{record.sites}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>{labour.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />

            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Note (optional)"
              placeholderTextColor={colors.text.secondary}
              value={paymentNote}
              onChangeText={setPaymentNote}
              multiline
            />

            <View style={styles.modalButtons}>
              <QuickActionButton
                title="Save"
                onPress={handleRecordPayment}
                variant="success"
              />
              <QuickActionButton
                title="Cancel"
                onPress={() => setShowPaymentModal(false)}
                variant="error"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Advance Modal */}
      <Modal
        visible={showAdvanceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdvanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Advance</Text>
            <Text style={styles.modalSubtitle}>{labour.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
            />

            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Note (optional)"
              placeholderTextColor={colors.text.secondary}
              value={advanceNote}
              onChangeText={setAdvanceNote}
              multiline
            />

            <View style={styles.modalButtons}>
              <QuickActionButton
                title="Save"
                onPress={handleRecordAdvance}
                variant="mint"
              />
              <QuickActionButton
                title="Cancel"
                onPress={() => setShowAdvanceModal(false)}
                variant="error"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Repayment Modal */}
      <Modal
        visible={showRepaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRepaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Collect Money Back</Text>
            <Text style={styles.modalSubtitle}>{labour.name}</Text>
            <Text style={styles.modalNote}>Worker owes: ₹{Math.abs(summary.netBalance)}</Text>

            <TextInput
              style={styles.input}
              placeholder="Amount Received (₹)"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              value={repaymentAmount}
              onChangeText={setRepaymentAmount}
            />

            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Note (optional)"
              placeholderTextColor={colors.text.secondary}
              value={repaymentNote}
              onChangeText={setRepaymentNote}
              multiline
            />

            <View style={styles.modalButtons}>
              <QuickActionButton
                title="Save"
                onPress={handleRecordRepayment}
                variant="success"
              />
              <QuickActionButton
                title="Cancel"
                onPress={() => setShowRepaymentModal(false)}
                variant="error"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  credentialsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.md,
  },
  credentialsTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  weeklyBreakdown: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  breakdownRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: colors.background,
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  breakdownLabelHighlight: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  breakdownValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  breakdownValueHighlight: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.lg,
  },
  transactionHeaderSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: theme.spacing.md,
  },
  transactionHeaderTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  transactionHeaderSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  siteHistoryCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  siteHistoryDate: {
    flex: 1,
  },
  siteHistoryDateText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  siteHistoryLocation: {
    flex: 2,
    alignItems: 'flex-end',
  },
  siteHistoryLocationText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  modalNote: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...typography.body,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputLarge: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    marginTop: theme.spacing.lg,
  },
});

export default LabourDetailScreen;
