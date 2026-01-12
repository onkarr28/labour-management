import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import { ChevronLeft } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import {
  formatDateForDisplay,
  getWeekStart,
  getWeekEnd,
  formatDateToString,
} from '../utils/dateHelpers';

const TransactionHistoryScreen = ({ navigation }) => {
  const { state, refreshData } = useLabour();
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'week', 'month'
  const [filterWorker, setFilterWorker] = useState('all');
  const [filterContractor, setFilterContractor] = useState('all'); // 'all', 'contractor_1', 'contractor_2'
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showWorkerDropdown, setShowWorkerDropdown] = useState(false);
  const [showContractorDropdown, setShowContractorDropdown] = useState(false);

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

  const transactions = useMemo(() => {
    const allTransactions = [];
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    state.labours.forEach((labour) => {
      // Attendance transactions
      if (labour.attendance) {
        Object.entries(labour.attendance).forEach(([date, record]) => {
          if (record.status === 'present') {
            const transactionDate = new Date(date);
            let include = false;

            if (filterPeriod === 'all') include = true;
            else if (filterPeriod === 'week')
              include = transactionDate >= weekStart && transactionDate <= weekEnd;
            else if (filterPeriod === 'month')
              include = transactionDate >= monthStart && transactionDate <= monthEnd;

            if (include && (filterWorker === 'all' || filterWorker === labour.id)) {
              allTransactions.push({
                id: `attendance-${labour.id}-${date}`,
                type: 'attendance',
                date,
                workerName: labour.name,
                workerId: labour.id,
                amount: labour.dailyRate,
                description: 'Present',
              });
            }
          }
        });
      }

      // Advance transactions
      if (labour.advances) {
        labour.advances.forEach((advance, index) => {
          const transactionDate = new Date(advance.date);
          let include = false;

          if (filterPeriod === 'all') include = true;
          else if (filterPeriod === 'week')
            include = transactionDate >= weekStart && transactionDate <= weekEnd;
          else if (filterPeriod === 'month')
            include = transactionDate >= monthStart && transactionDate <= monthEnd;

          if (include && (filterWorker === 'all' || filterWorker === labour.id)) {
            allTransactions.push({
              id: `advance-${labour.id}-${index}`,
              type: 'advance',
              date: advance.date,
              workerName: labour.name,
              workerId: labour.id,
              amount: advance.amount,
              description: advance.note || 'Advance payment',
              contractorName: advance.contractorName,
              paidBy: advance.paidBy,
            });
          }
        });
      }

      // Payment transactions
      if (labour.payments) {
        labour.payments.forEach((payment, index) => {
          const transactionDate = new Date(payment.date);
          let include = false;

          if (filterPeriod === 'all') include = true;
          else if (filterPeriod === 'week')
            include = transactionDate >= weekStart && transactionDate <= weekEnd;
          else if (filterPeriod === 'month')
            include = transactionDate >= monthStart && transactionDate <= monthEnd;

          if (include && (filterWorker === 'all' || filterWorker === labour.id)) {
            allTransactions.push({
              id: `payment-${labour.id}-${index}`,
              type: 'payment',
              date: payment.date,
              workerName: labour.name,
              workerId: labour.id,
              amount: payment.amount,
              description: payment.note || 'Salary payment',
              contractorName: payment.contractorName,
              paidBy: payment.paidBy,
            });
          }
        });
      }
    });

    // Filter by contractor (only for advances and payments, hide attendance when contractor selected)
    let filteredTransactions = allTransactions;
    if (filterContractor !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => {
        // Hide attendance/worked when specific contractor is selected
        if (t.type === 'attendance') return false;
        // For advance and payment, filter by contractor
        return t.paidBy === filterContractor;
      });
    }

    // Sort by date (newest first)
    return filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.labours, filterPeriod, filterWorker, filterContractor, refreshKey]);

  const summary = useMemo(() => {
    let totalEarned = 0;
    let totalAdvances = 0;
    let totalPaid = 0;

    transactions.forEach((t) => {
      if (t.type === 'attendance') totalEarned += t.amount;
      else if (t.type === 'advance') totalAdvances += t.amount;
      else if (t.type === 'payment') totalPaid += t.amount;
    });

    return {
      totalEarned,
      totalAdvances,
      totalPaid,
      netBalance: totalEarned - totalAdvances - totalPaid,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const getTransactionIcon = (type) => {
    if (type === 'attendance') return '→';
    if (type === 'advance') return '-';
    if (type === 'payment') return '+';
    return '•';
  };

  const getTransactionColor = (type) => {
    if (type === 'attendance') return colors.success;
    if (type === 'advance') return colors.warning;
    if (type === 'payment') return colors.primary.mint;
    return colors.text.secondary;
  };

  const getTransactionLabel = (type) => {
    if (type === 'advance') return 'Advance Given';
    if (type === 'payment') return 'Payment';
    if (type === 'attendance') return 'Worked';
    return 'Transaction';
  };

  const getPeriodLabel = (value) => {
    if (value === 'all') return 'All';
    if (value === 'week') return 'Week';
    if (value === 'month') return 'Month';
    return value;
  };

  const getWorkerLabel = (value) => {
    if (value === 'all') return 'All';
    const worker = state.labours.find(l => l.id === value);
    if (worker) {
      const nameParts = worker.name.trim().split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
      }
      return nameParts[0];
    }
    return value;
  };

  const getContractorLabel = (value) => {
    if (value === 'all') return 'All';
    if (value === 'contractor_1') return 'Shivaji';
    if (value === 'contractor_2') return 'Dattatray';
    return value;
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionCard, theme.shadows.soft]}>
      <View style={styles.transactionRow}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionWorker}>{item.workerName}</Text>
          <Text style={styles.transactionDate}>{formatDateForDisplay(item.date)}</Text>
        </View>
        <View style={styles.transactionType}>
          <Text style={[styles.transactionTypeLabel, { color: getTransactionColor(item.type) }]}>
            {getTransactionLabel(item.type)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amount,
              { color: getTransactionColor(item.type) },
            ]}
          >
            ₹{item.amount}
          </Text>
        </View>
      </View>
      {item.contractorName && (
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionByText}>Paid by: <Text style={styles.contractorName}>{item.contractorName}</Text></Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters Row - 3 Dropdowns */}
      <View style={styles.filtersRow}>
        {/* Period Dropdown */}
        <View style={styles.filterDropdown}>
          <Text style={styles.dropdownLabel}>Period</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setShowPeriodDropdown(!showPeriodDropdown);
              setShowWorkerDropdown(false);
              setShowContractorDropdown(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>{getPeriodLabel(filterPeriod)}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showPeriodDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterPeriod('all');
                  setShowPeriodDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>All Time</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterPeriod('week');
                  setShowPeriodDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterPeriod('month');
                  setShowPeriodDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>This Month</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Worker Dropdown */}
        <View style={styles.filterDropdown}>
          <Text style={styles.dropdownLabel}>Worker</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setShowWorkerDropdown(!showWorkerDropdown);
              setShowPeriodDropdown(false);
              setShowContractorDropdown(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>{getWorkerLabel(filterWorker)}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showWorkerDropdown && (
            <View style={styles.dropdownMenu}>
              <ScrollView nestedScrollEnabled={true} scrollEnabled={state.labours.length > 5}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilterWorker('all');
                    setShowWorkerDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>All</Text>
                </TouchableOpacity>
                {state.labours.map((labour) => (
                  <TouchableOpacity
                    key={labour.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFilterWorker(labour.id);
                      setShowWorkerDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{labour.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Contractor Dropdown */}
        <View style={styles.filterDropdown}>
          <Text style={styles.dropdownLabel}>Paid By</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setShowContractorDropdown(!showContractorDropdown);
              setShowPeriodDropdown(false);
              setShowWorkerDropdown(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>{getContractorLabel(filterContractor)}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showContractorDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterContractor('all');
                  setShowContractorDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterContractor('contractor_1');
                  setShowContractorDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Shivaji</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterContractor('contractor_2');
                  setShowContractorDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Dattatray</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {summary.transactionCount} Transaction{summary.transactionCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.mint}
            colors={[colors.primary.mint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
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
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterDropdown: {
    flex: 1,
    minWidth: 80,
    position: 'relative',
  },
  dropdownLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    fontSize: 11,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
  },
  dropdownButtonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 11,
    flex: 1,
  },
  dropdownArrow: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 8,
    marginLeft: theme.spacing.xs,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: theme.spacing.xs,
    zIndex: 9999,
    elevation: 10,
    maxHeight: 200,
    ...theme.shadows.soft,
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownItemText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontSize: 12,
  },
  filterGroup: {
    marginBottom: theme.spacing.sm,
  },
  filterLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: theme.spacing.sm,
    minWidth: 90,
  },
  filterChipActive: {
    backgroundColor: colors.primary.mint,
    borderColor: colors.primary.mint,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  summarySection: {
    display: 'none',
  },
  summaryCard: {
    display: 'none',
  },
  summaryLabel: {
    display: 'none',
  },
  summaryValue: {
    display: 'none',
  },
  listHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  listTitle: {
    ...typography.h4,
    fontSize: 16,
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  transactionCard: {
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.mint,
    ...theme.shadows.soft,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  transactionInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  transactionWorker: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  transactionType: {
    marginHorizontal: theme.spacing.sm,
  },
  transactionTypeLabel: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: '700',
  },
  transactionFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  transactionByText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  contractorName: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  transactionLeft: {
    flexDirection: 'column',
    flex: 1,
  },
  workerName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  contractorBadge: {
    ...typography.caption,
    color: colors.primary.mint,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 11,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default TransactionHistoryScreen;
