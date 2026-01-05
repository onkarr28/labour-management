/**
 * Calculate total days a worker was present
 */
export const calculatePresentDays = (attendance) => {
  if (!attendance) return 0;
  return Object.values(attendance).filter(
    (day) => day.status === 'present' && day.marked
  ).length;
};

/**
 * Calculate total earned amount based on present days and daily rate
 */
export const calculateEarned = (presentDays, dailyRate) => {
  return presentDays * dailyRate;
};

/**
 * Calculate total advances taken
 */
export const calculateTotalAdvances = (advances) => {
  if (!advances || advances.length === 0) return 0;
  return advances.reduce((sum, advance) => sum + advance.amount, 0);
};

/**
 * Calculate net payable amount (earned - advances)
 */
export const calculateNetPayable = (earned, totalAdvances) => {
  return earned - totalAdvances;
};

/**
 * Calculate attendance percentage
 */
export const calculateAttendancePercentage = (presentDays, totalWorkingDays) => {
  if (totalWorkingDays === 0) return 0;
  return Math.round((presentDays / totalWorkingDays) * 100);
};

/**
 * Get attendance summary for a date range
 */
export const getAttendanceSummary = (attendance, startDate, endDate) => {
  if (!attendance) return { present: 0, absent: 0, unmarked: 0 };
  
  let present = 0;
  let absent = 0;
  let unmarked = 0;

  Object.entries(attendance).forEach(([date, record]) => {
    const attendanceDate = new Date(date);
    if (attendanceDate >= startDate && attendanceDate <= endDate) {
      if (record.marked) {
        if (record.status === 'present') present++;
        else if (record.status === 'absent') absent++;
      } else {
        unmarked++;
      }
    }
  });

  return { present, absent, unmarked };
};

/**
 * Calculate week summary for a worker
 */
export const calculateWeekSummary = (worker, weekStartDate) => {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const { present } = getAttendanceSummary(
    worker.attendance,
    weekStartDate,
    weekEndDate
  );

  const weekAdvances = (worker.advances || []).filter((advance) => {
    const advanceDate = new Date(advance.date);
    return advanceDate >= weekStartDate && advanceDate <= weekEndDate;
  });

  const weekAdvanceTotal = weekAdvances.reduce(
    (sum, adv) => sum + adv.amount,
    0
  );

  const earned = calculateEarned(present, worker.dailyRate);
  const netPay = earned - weekAdvanceTotal;

  return {
    presentDays: present,
    earned,
    weekAdvances: weekAdvanceTotal,
    netPay,
  };
};

/**
 * Calculate advance to earned ratio
 */
export const calculateAdvanceRatio = (totalAdvances, earned) => {
  if (earned === 0) return 0;
  return Math.round((totalAdvances / earned) * 100);
};
