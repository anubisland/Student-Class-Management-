/**
 * Class management helper functions for Student Class Management App
 */

import { formatDate, getDaysInMonth, getDayOfWeek } from './dateHelpers';

/**
 * Gets classes for a specific student in a specific month
 * @param {string} student - Student key (e.g., 'kareem', 'saraHana')
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} classes - All classes object
 * @returns {Array} Filtered and sorted classes for the student in that month
 */
export const getMonthlyClasses = (student, month, classes) => {
  if (!classes || !classes[student]) return [];

  return classes[student]
    .filter((cls) => cls.date && cls.date.startsWith(month))
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateB.getTime() - dateA.getTime();
    });
};

/**
 * Gets statistics for a student in a specific month
 * @param {string} student - Student key
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} classes - All classes object
 * @param {Object} prices - Prices object with student keys
 * @returns {Object} Stats object with classCount, total, and classes
 */
export const getStudentStats = (student, month, classes, prices) => {
  const monthlyClasses = getMonthlyClasses(student, month, classes);
  const studentPrice = parseFloat(prices[student]) || 0;
  const total = monthlyClasses.length * studentPrice;

  return {
    classCount: monthlyClasses.length,
    total: total,
    classes: monthlyClasses
  };
};

/**
 * Checks if a class already exists (duplicate detection)
 * @param {Array} existingClasses - Array of existing classes
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} True if class exists
 */
export const classExists = (existingClasses, date, time) => {
  if (!existingClasses || !Array.isArray(existingClasses)) return false;
  return existingClasses.some(cls => cls.date === date && cls.time === time);
};

/**
 * Creates a new class object
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} student - Student key
 * @param {boolean} generated - Whether the class was auto-generated
 * @returns {Object} New class object
 */
export const createClass = (date, time, student, generated = false) => {
  return {
    id: generated
      ? `class_${student}_${date}_${time}_${Date.now()}_${Math.random().toString(36).substring(2)}`
      : Date.now(),
    date,
    time,
    student,
    timestamp: new Date().toISOString(),
    generated
  };
};

/**
 * Generates classes for a student based on their schedules for a specific month
 * @param {string} studentKey - Student key
 * @param {Array} schedules - Array of schedule objects with day and time
 * @param {string} monthString - Month in YYYY-MM format
 * @param {Array} existingClasses - Existing classes for the student
 * @returns {Object} Object with newClasses array and count
 */
export const generateClassesForMonth = (studentKey, schedules, monthString, existingClasses = []) => {
  if (!schedules || schedules.length === 0) {
    return { newClasses: [], count: 0 };
  }

  const [year, month] = monthString.split('-');
  const yearInt = parseInt(year);
  const monthInt = parseInt(month);
  const daysInMonth = getDaysInMonth(yearInt, monthInt);

  const newClasses = [];

  schedules.forEach(schedule => {
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(yearInt, monthInt - 1, day);
      const dayOfWeek = getDayOfWeek(checkDate);

      if (dayOfWeek === schedule.day) {
        const dateString = formatDate(checkDate);

        // Check if class already exists
        if (!classExists(existingClasses, dateString, schedule.time) &&
            !classExists(newClasses, dateString, schedule.time)) {
          const newClass = createClass(dateString, schedule.time, studentKey, true);
          newClasses.push(newClass);
        }
      }
    }
  });

  return { newClasses, count: newClasses.length };
};

/**
 * Removes a class from a student's class list
 * @param {Object} classes - All classes object
 * @param {string} studentKey - Student key
 * @param {string|number} classId - Class ID to remove
 * @returns {Object} Updated classes object
 */
export const removeClass = (classes, studentKey, classId) => {
  if (!classes[studentKey]) return classes;

  return {
    ...classes,
    [studentKey]: classes[studentKey].filter(c => c.id !== classId)
  };
};

/**
 * Adds a class to a student's class list
 * @param {Object} classes - All classes object
 * @param {string} studentKey - Student key
 * @param {Object} newClass - Class object to add
 * @returns {Object} Updated classes object
 */
export const addClassToStudent = (classes, studentKey, newClass) => {
  return {
    ...classes,
    [studentKey]: [...(classes[studentKey] || []), newClass]
  };
};

/**
 * Calculates total revenue across all students for a month
 * @param {Array} students - Array of student objects with key property
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} classes - All classes object
 * @param {Object} prices - Prices object
 * @returns {Object} Object with totalClasses and totalRevenue
 */
export const calculateMonthlyTotals = (students, month, classes, prices) => {
  let totalClasses = 0;
  let totalRevenue = 0;

  students.forEach(student => {
    const stats = getStudentStats(student.key, month, classes, prices);
    totalClasses += stats.classCount;
    totalRevenue += stats.total;
  });

  return { totalClasses, totalRevenue };
};
