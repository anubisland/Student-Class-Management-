/**
 * Schedule management helper functions for Student Class Management App
 */

/**
 * Days of the week
 */
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Calendar day labels (short form)
 */
export const CALENDAR_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Creates a new schedule object
 * @param {string} day - Day of the week
 * @param {string} time - Time in HH:MM format
 * @param {string} student - Student key
 * @returns {Object} New schedule object
 */
export const createSchedule = (day, time, student) => {
  return {
    id: Date.now(),
    day,
    time,
    student
  };
};

/**
 * Adds a schedule to a student's schedule list
 * @param {Object} schedules - All schedules object
 * @param {string} studentKey - Student key
 * @param {Object} newSchedule - Schedule object to add
 * @returns {Object} Updated schedules object
 */
export const addScheduleToStudent = (schedules, studentKey, newSchedule) => {
  const currentSchedules = { ...schedules };
  if (!currentSchedules[studentKey]) {
    currentSchedules[studentKey] = [];
  }
  currentSchedules[studentKey] = [...currentSchedules[studentKey], newSchedule];
  return currentSchedules;
};

/**
 * Removes a schedule from a student's schedule list
 * @param {Object} schedules - All schedules object
 * @param {string} studentKey - Student key
 * @param {number} scheduleId - Schedule ID to remove
 * @returns {Object} Updated schedules object
 */
export const removeScheduleFromStudent = (schedules, studentKey, scheduleId) => {
  if (!schedules[studentKey]) return schedules;

  return {
    ...schedules,
    [studentKey]: schedules[studentKey].filter(s => s.id !== scheduleId)
  };
};

/**
 * Checks if a student has any schedules
 * @param {Object} schedules - All schedules object
 * @param {string} studentKey - Student key
 * @returns {boolean} True if student has schedules
 */
export const hasSchedules = (schedules, studentKey) => {
  return !!(schedules[studentKey] && schedules[studentKey].length > 0);
};

/**
 * Checks if any student has schedules
 * @param {Object} schedules - All schedules object
 * @returns {boolean} True if any student has schedules
 */
export const hasAnySchedules = (schedules) => {
  return Object.values(schedules).some(arr => arr && arr.length > 0);
};

/**
 * Gets the count of schedules for a student
 * @param {Object} schedules - All schedules object
 * @param {string} studentKey - Student key
 * @returns {number} Number of schedules
 */
export const getScheduleCount = (schedules, studentKey) => {
  if (!schedules[studentKey]) return 0;
  return schedules[studentKey].length;
};

/**
 * Checks if a schedule already exists for a student (same day and time)
 * @param {Object} schedules - All schedules object
 * @param {string} studentKey - Student key
 * @param {string} day - Day of the week
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} True if schedule exists
 */
export const scheduleExists = (schedules, studentKey, day, time) => {
  if (!schedules[studentKey]) return false;
  return schedules[studentKey].some(s => s.day === day && s.time === time);
};

/**
 * Gets all schedules for a specific day
 * @param {Object} schedules - All schedules object
 * @param {string} day - Day of the week
 * @returns {Array} Array of schedules for that day (across all students)
 */
export const getSchedulesForDay = (schedules, day) => {
  const result = [];
  Object.entries(schedules).forEach(([studentKey, studentSchedules]) => {
    if (studentSchedules && Array.isArray(studentSchedules)) {
      studentSchedules
        .filter(s => s.day === day)
        .forEach(s => result.push({ ...s, studentKey }));
    }
  });
  return result;
};

/**
 * Formats a schedule for display
 * @param {Object} schedule - Schedule object
 * @returns {string} Formatted schedule string
 */
export const formatSchedule = (schedule) => {
  return `${schedule.day} at ${schedule.time}`;
};
