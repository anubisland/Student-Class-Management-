/**
 * Report generation helper functions for Student Class Management App
 */

import { getMonthName } from './dateHelpers';
import { getMonthlyClasses, getStudentStats } from './classHelpers';

/**
 * Student configuration
 */
export const STUDENTS = [
  { key: 'kareem', name: 'Kareem', color: '#3B82F6' },
  { key: 'saraHana', name: 'Sara_Hana', color: '#EC4899' }
];

/**
 * Generates a basic report text for sharing
 * @param {string} type - 'combined' or student key
 * @param {string} currentMonth - Month in YYYY-MM format
 * @param {Object} classes - All classes object
 * @param {Object} prices - Prices object
 * @returns {string} Report text
 */
export const generateReportText = (type, currentMonth, classes, prices) => {
  const monthName = getMonthName(currentMonth);
  let reportText = `Student Class Management Report\n${monthName}\n\n`;

  if (type === 'combined') {
    reportText += 'Combined Report\n';
    STUDENTS.forEach(student => {
      const count = getMonthlyClasses(student.key, currentMonth, classes).length;
      reportText += `${student.name}: ${count} classes\n`;
    });
  } else {
    const student = STUDENTS.find(s => s.key === type);
    const stats = getStudentStats(type, currentMonth, classes, prices);
    const studentPrice = parseFloat(prices[type]) || 0;

    reportText += `${student?.name} Report\n`;
    reportText += `Total Classes: ${stats.classCount}\n`;
    reportText += `Price per Class: $${studentPrice.toFixed(2)}\n`;
    reportText += `Total Amount: $${stats.total.toFixed(2)}\n`;
  }

  return reportText;
};

/**
 * Generates a detailed download report
 * @param {string} type - 'combined' or student key
 * @param {string} currentMonth - Month in YYYY-MM format
 * @param {Object} classes - All classes object
 * @param {Object} prices - Prices object
 * @returns {Object} Object with fileName and content
 */
export const generateDownloadReport = (type, currentMonth, classes, prices) => {
  const monthName = getMonthName(currentMonth);
  let reportContent = `Student Class Management Report\n${monthName}\n${'='.repeat(50)}\n\n`;
  let fileName = '';

  if (type === 'combined') {
    const kareemClasses = getMonthlyClasses('kareem', currentMonth, classes);
    const saraHanaClasses = getMonthlyClasses('saraHana', currentMonth, classes);
    const kareemPrice = parseFloat(prices.kareem) || 0;
    const saraHanaPrice = parseFloat(prices.saraHana) || 0;
    const kareemTotal = kareemClasses.length * kareemPrice;
    const saraHanaTotal = saraHanaClasses.length * saraHanaPrice;
    const grandTotal = kareemTotal + saraHanaTotal;

    fileName = `Combined_Report_${monthName.replace(' ', '_')}.txt`;
    reportContent += `COMBINED MONTHLY REPORT\n\n`;
    reportContent += `Kareem:\n`;
    reportContent += `  Classes: ${kareemClasses.length}\n`;
    reportContent += `  Price per Class: $${kareemPrice.toFixed(2)}\n`;
    reportContent += `  Total: $${kareemTotal.toFixed(2)}\n\n`;
    reportContent += `Sara_Hana:\n`;
    reportContent += `  Classes: ${saraHanaClasses.length}\n`;
    reportContent += `  Price per Class: $${saraHanaPrice.toFixed(2)}\n`;
    reportContent += `  Total: $${saraHanaTotal.toFixed(2)}\n\n`;
    reportContent += `${'='.repeat(30)}\n`;
    reportContent += `GRAND TOTAL: $${grandTotal.toFixed(2)}\n`;
  } else {
    const student = STUDENTS.find(s => s.key === type);
    const monthlyClasses = getMonthlyClasses(type, currentMonth, classes);
    const studentPrice = parseFloat(prices[type]) || 0;
    const total = monthlyClasses.length * studentPrice;

    fileName = `${student?.name}_Report_${monthName.replace(' ', '_')}.txt`;
    reportContent += `${student?.name.toUpperCase()} REPORT\n\n`;
    reportContent += `Total Classes: ${monthlyClasses.length}\n`;
    reportContent += `Price per Class: $${studentPrice.toFixed(2)}\n`;
    reportContent += `Total Amount: $${total.toFixed(2)}\n\n`;

    if (monthlyClasses.length > 0) {
      reportContent += `CLASS DETAILS:\n`;
      reportContent += `${'='.repeat(30)}\n`;
      monthlyClasses.forEach((cls, index) => {
        reportContent += `${index + 1}. ${cls.date} at ${cls.time}\n`;
      });
    }
  }

  reportContent += `\n\nGenerated on: ${new Date().toLocaleString()}\n`;
  reportContent += `Student Class Management App v1.0\n`;

  return { fileName, content: reportContent };
};

/**
 * Formats currency value
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

/**
 * Gets price display value for a student
 * @param {Object} prices - Prices object
 * @param {string} studentKey - Student key
 * @returns {string} Formatted price string
 */
export const getStudentPrice = (prices, studentKey) => {
  const price = parseFloat(prices[studentKey]) || 0;
  return formatCurrency(price);
};
