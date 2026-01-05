import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { ChevronLeft, ChevronRight } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import {
  formatDateToString,
  parseStringToDate,
  getMonthName,
  getWorkingDaysInMonth,
} from '../utils/dateHelpers';
import {
  calculatePresentDays,
  calculateEarned,
  calculateTotalAdvances,
  calculateNetPayable,
} from '../utils/calculations';
import QuickActionButton from '../components/QuickActionButton';

const AttendanceCalendarScreen = ({ route, navigation }) => {
  const { labourId } = route.params;
  const { state, updateAttendance, addAdvance } = useLabour();
  const labour = state.labours.find((l) => l.id === labourId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedDateForAdvance, setSelectedDateForAdvance] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');

  if (!labour) {
    return (
      <View style={styles.container}>
        <Text>Worker not found</Text>
      </View>
    );
  }

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getDateString = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return formatDateToString(date);
  };

  const getAttendanceStatus = (day) => {
    if (!day) return null;
    const dateStr = getDateString(day);
    return labour.attendance ? labour.attendance[dateStr] : null;
  };

  const handleMarkAttendance = (day, status) => {
    const dateStr = getDateString(day);
    updateAttendance(labourId, dateStr, {
      status,
      marked: true,
    });
  };

  const handleAddAdvance = (day) => {
    const dateStr = getDateString(day);
    setSelectedDateForAdvance(dateStr);
    setShowAdvanceModal(true);
  };

  const handleSaveAdvance = () => {
    const amount = parseInt(advanceAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addAdvance(labourId, {
      date: selectedDateForAdvance,
      amount,
      note: advanceNote,
    });

    setAdvanceAmount('');
    setAdvanceNote('');
    setShowAdvanceModal(false);
    Alert.alert('Success', 'Advance recorded successfully!');
  };

  // Calculate summary
  const summary = useMemo(() => {
    const presentDays = calculatePresentDays(labour.attendance);
    const earned = calculateEarned(presentDays, labour.dailyRate);
    const totalAdvances = calculateTotalAdvances(labour.advances);
    const netPayable = calculateNetPayable(earned, totalAdvances);

    return { presentDays, earned, totalAdvances, netPayable };
  }, [labour]);

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
          <View style={styles.headerContent}>
            <Text style={styles.workerName}>{labour.name}</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }
          >
            <ChevronRight size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={[styles.calendar, theme.shadows.soft]}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const attendance = getAttendanceStatus(day);
              const isPresentDay = attendance?.status === 'present';
              const isAbsentDay = attendance?.status === 'absent';

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isPresentDay && styles.dayPresent,
                    isAbsentDay && styles.dayAbsent,
                  ]}
                  onPress={() => handleMarkAttendance(day, isPresentDay ? 'absent' : 'present')}
                  onLongPress={() => handleAddAdvance(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      (isPresentDay || isAbsentDay) && styles.dayTextMarked,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Month Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Days Present</Text>
              <Text style={styles.summaryValue}>{summary.presentDays}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Amount Earned</Text>
              <Text style={styles.summaryValue}>₹{summary.earned}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Advance</Text>
              <Text style={styles.summaryValue}>₹{summary.totalAdvances}</Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemHighlight]}>
              <Text style={styles.summaryLabel}>Net Payable</Text>
              <Text style={styles.summaryValue}>₹{summary.netPayable}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <QuickActionButton
            title="View Details"
            onPress={() => navigation.navigate('LabourDetail', { labourId })}
            variant="blue"
          />
        </View>
      </ScrollView>

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
            <Text style={styles.modalDate}>{selectedDateForAdvance}</Text>

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
                onPress={handleSaveAdvance}
                variant="success"
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  workerName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  monthTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  calendar: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  dayHeader: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  dayPresent: {
    backgroundColor: colors.success,
  },
  dayAbsent: {
    backgroundColor: colors.error,
  },
  dayText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dayTextMarked: {
    color: colors.card,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  summaryItemHighlight: {
    backgroundColor: colors.primary.mint,
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
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  modalDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: theme.spacing.md,
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

export default AttendanceCalendarScreen;
