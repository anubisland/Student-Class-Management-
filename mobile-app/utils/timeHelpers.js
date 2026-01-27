/**
 * Time helper functions for Student Class Management App
 */

/**
 * Increments/decrements an hour value with wrap-around (0-23)
 * @param {number} current - Current hour value
 * @param {number} delta - Amount to add (positive) or subtract (negative)
 * @returns {number} New hour value (0-23)
 */
export const incrementHour = (current, delta) => {
  return ((current + delta) % 24 + 24) % 24;
};

/**
 * Increments/decrements a minute value with wrap-around (0-59)
 * @param {number} current - Current minute value
 * @param {number} delta - Amount to add (positive) or subtract (negative)
 * @returns {number} New minute value (0-59)
 */
export const incrementMinute = (current, delta) => {
  return ((current + delta) % 60 + 60) % 60;
};

/**
 * Formats hour and minute values to HH:MM string
 * @param {number} hour - Hour value (0-23)
 * @param {number} minute - Minute value (0-59)
 * @returns {string} Formatted time string (e.g., "09:30")
 */
export const formatTime = (hour, minute) => {
  const hourStr = String(hour).padStart(2, '0');
  const minStr = String(minute).padStart(2, '0');
  return `${hourStr}:${minStr}`;
};

/**
 * Parses a time string to hour and minute values
 * @param {string} timeString - Time in HH:MM format
 * @returns {Object} Object with hour and minute properties
 */
export const parseTime = (timeString) => {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
};

/**
 * Validates if a time string is in correct HH:MM format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid
 */
export const isValidTimeString = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return false;
  const pattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return pattern.test(timeString);
};

/**
 * Compares two time strings
 * @param {string} time1 - First time in HH:MM format
 * @param {string} time2 - Second time in HH:MM format
 * @returns {number} Negative if time1 < time2, 0 if equal, positive if time1 > time2
 */
export const compareTime = (time1, time2) => {
  const t1 = parseTime(time1);
  const t2 = parseTime(time2);

  if (t1.hour !== t2.hour) {
    return t1.hour - t2.hour;
  }
  return t1.minute - t2.minute;
};

/**
 * Quick minute presets
 */
export const QUICK_MINUTES = [0, 15, 30, 45];

/**
 * Gets the nearest quick minute value
 * @param {number} minute - Current minute value
 * @returns {number} Nearest quick minute value
 */
export const getNearestQuickMinute = (minute) => {
  return QUICK_MINUTES.reduce((prev, curr) =>
    Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
  );
};
