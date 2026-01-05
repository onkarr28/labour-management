/**
 * Get the start of the current week (Monday)
 */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get the end of the current week (Sunday)
 */
export const getWeekEnd = (date = new Date()) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateToString = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Parse string date to Date object
 */
export const parseStringToDate = (dateString) => {
  return new Date(dateString + 'T00:00:00');
};

/**
 * Format date for display (e.g., "Jan 15, 2025")
 */
export const formatDateForDisplay = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = () => {
  return formatDateToString(new Date());
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  return dateString === getTodayString();
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString) => {
  const date = parseStringToDate(dateString);
  return date < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (dateString) => {
  const date = parseStringToDate(dateString);
  return date > new Date();
};

/**
 * Get month name
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

/**
 * Get number of working days in a month (excluding Sundays)
 */
export const getWorkingDaysInMonth = (year, month) => {
  let workingDays = 0;
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    if (date.getDay() !== 0) {
      workingDays++;
    }
    date.setDate(date.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * Get date X days from today
 */
export const getDateFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
};
