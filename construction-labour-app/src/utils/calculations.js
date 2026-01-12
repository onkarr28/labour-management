/**
 * Calculate total days a worker was present (includes half days as 0.5)
 */
export const calculatePresentDays = (attendance) => {
  if (!attendance) return 0;
  let totalDays = 0;
  Object.values(attendance).forEach((day) => {
    if (day.marked) {
      if (day.status === 'present') {
        totalDays += 1;
      } else if (day.status === 'half-day') {
        totalDays += 0.5;
      }
    }
  });
  return totalDays;
};

/**
 * Calculate total earned amount based on present days and daily rate
 */
export const calculateEarned = (presentDays, dailyRate) => {
  return presentDays * dailyRate;
};

/**
 * Calculate total advances taken (all contractors combined)
 * Each advance tracks who paid it (paidBy field)
 */
export const calculateTotalAdvances = (advances) => {
  if (!advances || advances.length === 0) return 0;
  return advances.reduce((sum, advance) => sum + advance.amount, 0);
};

/**
 * Calculate total payments made to the worker
 */
export const calculateTotalPayments = (payments) => {
  if (!payments || payments.length === 0) return 0;
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
};

/**
 * Calculate total repayments received from the worker (when they owe money)
 */
export const calculateTotalRepayments = (repayments) => {
  if (!repayments || repayments.length === 0) return 0;
  return repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
};

/**
 * Calculate net payable amount (earned - advances)
 * (Used mainly for weekly summaries where payments are not considered.)
 */
export const calculateNetPayable = (earned, totalAdvances) => {
  return earned - totalAdvances;
};

/**
 * Calculate current balance considering payments and repayments
 * Formula: earned - advances - payments + repayments
 * Repayments are added because they reduce the debt owed by the worker
 */
export const calculateNetBalance = (earned, totalAdvances, totalPayments, totalRepayments = 0) => {
  return earned - totalAdvances - totalPayments + totalRepayments;
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
        else if (record.status === 'half-day') present += 0.5;
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
 * All advances, payments, and repayments are shared - but tracked by who paid/received
 */
export const calculateWeekSummary = (worker, weekStartDate) => {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const { present } = getAttendanceSummary(
    worker.attendance,
    weekStartDate,
    weekEndDate
  );

  // All advances are shared across contractors
  const weekAdvances = (worker.advances || []).filter((advance) => {
    const advanceDate = new Date(advance.date);
    return advanceDate >= weekStartDate && advanceDate <= weekEndDate;
  });

  const weekAdvanceTotal = weekAdvances.reduce(
    (sum, adv) => sum + adv.amount,
    0
  );

  // All payments are shared across contractors
  const weekPayments = (worker.payments || []).filter((payment) => {
    const paymentDate = new Date(payment.date);
    return paymentDate >= weekStartDate && paymentDate <= weekEndDate;
  });

  const weekPaymentTotal = weekPayments.reduce(
    (sum, pay) => sum + pay.amount,
    0
  );

  // All repayments are shared across contractors
  const weekRepayments = (worker.repayments || []).filter((repayment) => {
    const repaymentDate = new Date(repayment.date);
    return repaymentDate >= weekStartDate && repaymentDate <= weekEndDate;
  });

  const weekRepaymentTotal = weekRepayments.reduce(
    (sum, rep) => sum + rep.amount,
    0
  );

  const earned = calculateEarned(present, worker.dailyRate);
  // Net pay: earned - ALL advances - ALL payments + ALL repayments (same for all contractors)
  const netPay = earned - weekAdvanceTotal - weekPaymentTotal + weekRepaymentTotal;

  return {
    presentDays: present,
    earned,
    weekAdvances: weekAdvanceTotal,
    weekPayments: weekPaymentTotal,
    weekRepayments: weekRepaymentTotal,
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
