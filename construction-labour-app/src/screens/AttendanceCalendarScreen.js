import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight } from '../components/Icons';
import { useLabour } from '../context/LabourContext';
import { colors, theme } from '../constants/colors';
import { typography } from '../constants/typography';
import {
  formatDateToString,
  getMonthName,
  isFutureDate,
  isToday,
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
  const { state } = useLabour();
  const labour = state.labours.find((l) => l.id === labourId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Calendar is now read-only; changes happen from Quick Attendance / detail screens

  // Calculate summary
  const summary = useMemo(() => {
    const presentDays = calculatePresentDays(labour.attendance);
    const earned = calculateEarned(presentDays, labour.dailyRate);
    const totalAdvances = calculateTotalAdvances(labour.advances);
    const netPayable = calculateNetPayable(earned, totalAdvances);

    return { presentDays, earned, totalAdvances, netPayable };
  }, [labour]);

  return (
    <View style={styles.container}>
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
              const isHalfDay = attendance?.status === 'half-day';
              const isAbsentDay = attendance?.status === 'absent';
              const dateStr = getDateString(day);
              const today = isToday(dateStr);
              const hasAdvance = (labour.advances || []).some(
                (adv) => adv.date === dateStr,
              );

              return (
                <View
                  key={day}
                  style={[
                    styles.dayCell,
                    isPresentDay && styles.dayPresent,
                    isHalfDay && styles.dayHalfDay,
                    isAbsentDay && styles.dayAbsent,
                    today && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      (isPresentDay || isHalfDay || isAbsentDay) && styles.dayTextMarked,
                    ]}
                  >
                    {day}
                  </Text>
                  {isHalfDay && <View style={styles.halfDayIndicator} />}
                  {hasAdvance && <View style={styles.advanceDot} />}
                </View>
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
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
    marginHorizontal: 2,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: colors.primary.blue,
  },
  dayPresent: {
    backgroundColor: colors.success,
  },
  dayHalfDay: {
    backgroundColor: colors.warning,
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
  advanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.mint,
    marginTop: 2,
  },
  halfDayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
    marginTop: 2,
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
});

export default AttendanceCalendarScreen;
