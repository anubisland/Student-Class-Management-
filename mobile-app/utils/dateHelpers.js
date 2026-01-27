/**
 * Date helper functions for Student Class Management App
 */

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts a YYYY-MM month string to "Month Year" format
 * @param {string} monthString - Month in YYYY-MM format
 * @returns {string} Formatted month name (e.g., "January 2025")
 */
export const getMonthName = (monthString) => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Gets the current month as a YYYY-MM string
 * @returns {string} Current month string
 */
export const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Navigates to a different month from the current month string
 * @param {string} currentMonth - Current month in YYYY-MM format
 * @param {number} direction - Direction to navigate (+1 for next, -1 for previous)
 * @returns {string} New month string
 */
export const navigateMonthString = (currentMonth, direction) => {
  const [year, month] = currentMonth.split('-');
  const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  currentDate.setMonth(currentDate.getMonth() + direction);
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Generates a calendar grid array for a given month
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed, 0 = January)
 * @returns {Array} Array of day numbers with null padding for alignment
 */
export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add day numbers
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
};

/**
 * Gets the number of days in a month
 * @param {number} year - The year
 * @param {number} month - The month (1-indexed, 1 = January)
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Checks if a year is a leap year
 * @param {number} year - The year to check
 * @returns {boolean} True if leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Gets the day of week name for a given date
 * @param {Date} date - The date
 * @returns {string} Day name (e.g., "Monday")
 */
export const getDayOfWeek = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Gets available months - current month + 11 more plus any months with existing classes
 * @param {Object} classes - Classes object with student keys
 * @returns {Array} Sorted array of month strings
 */
export const getAvailableMonths = (classes = {}) => {
  const months = new Set();

  // Add current month and next 11 months (12 months total)
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(monthString);
  }

  // Add months from existing classes
  Object.values(classes).forEach(studentClasses => {
    if (studentClasses && Array.isArray(studentClasses)) {
      studentClasses.forEach(cls => {
        if (cls && cls.date) {
          const monthString = cls.date.substring(0, 7); // YYYY-MM format
          months.add(monthString);
        }
      });
    }
  });

  return Array.from(months).sort((a, b) => a.localeCompare(b));
};
