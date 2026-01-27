// Test utilities and helpers
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Mock data generators
export const mockStudents = [
  { key: 'kareem', name: 'Kareem', color: '#6366F1' },
  { key: 'saraHana', name: 'Sara_Hana', color: '#EC4899' },
];

export const mockPrices = {
  kareem: '25.00',
  saraHana: '30.00',
};

export const mockSchedule = (studentKey, day = 'Monday', time = '10:00') => ({
  id: `schedule-${Date.now()}-${Math.random()}`,
  day,
  time,
  student: studentKey,
});

export const mockClass = (studentKey, date = '2025-01-15', time = '10:00', generated = false) => ({
  id: `class-${Date.now()}-${Math.random()}`,
  date,
  time,
  timestamp: new Date(date + 'T' + time).getTime(),
  generated,
  student: studentKey,
});

export const mockSchedules = {
  kareem: [
    mockSchedule('kareem', 'Monday', '10:00'),
    mockSchedule('kareem', 'Wednesday', '14:00'),
  ],
  saraHana: [
    mockSchedule('saraHana', 'Tuesday', '11:00'),
    mockSchedule('saraHana', 'Thursday', '15:00'),
  ],
};

export const mockClasses = {
  kareem: [
    mockClass('kareem', '2025-01-06', '10:00', true),
    mockClass('kareem', '2025-01-08', '14:00', true),
    mockClass('kareem', '2025-01-13', '10:00', true),
  ],
  saraHana: [
    mockClass('saraHana', '2025-01-07', '11:00', true),
    mockClass('saraHana', '2025-01-09', '15:00', true),
  ],
};

// Date helpers for testing
export const createDate = (year, month, day, hour = 0, minute = 0) => {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

export const formatTestDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTestTime = (hour, minute) => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// Days of week for testing
export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Get day of week for a date (0 = Sunday, 1 = Monday, etc)
export const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Calculate expected classes for a month based on schedules
export const calculateExpectedClasses = (schedules, year, month) => {
  const result = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayName = getDayName(date);

    schedules.forEach(schedule => {
      if (schedule.day === dayName) {
        result.push({
          date: formatTestDate(date),
          time: schedule.time,
          student: schedule.student,
        });
      }
    });
  }

  return result;
};

// Async test helpers
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export const waitForAsyncUpdates = async () => {
  await act(async () => {
    await flushPromises();
  });
};

// Mock AsyncStorage setup helper
export const setupMockStorage = (AsyncStorage, data = {}) => {
  AsyncStorage.__reset();
  if (data.prices) {
    AsyncStorage.__setStorage({
      'student-prices': JSON.stringify(data.prices),
      'student-classes': JSON.stringify(data.classes || {}),
      'student-schedules': JSON.stringify(data.schedules || {}),
    });
  }
};

// Test IDs commonly used
export const testIds = {
  loadingIndicator: 'loading',
  modal: 'modal',
  card: 'card',
};

// Press Alert button helper
export const pressAlertButton = (buttonIndex = 0) => {
  if (global.lastAlertButtons && global.lastAlertButtons[buttonIndex]) {
    const button = global.lastAlertButtons[buttonIndex];
    if (button.onPress) {
      button.onPress();
    }
  }
};

// Generate random ID similar to the app
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Month string helpers
export const getMonthString = (year, month) => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const getCurrentMonthString = () => {
  const now = new Date();
  return getMonthString(now.getFullYear(), now.getMonth() + 1);
};

// Assertion helpers
export const expectClassCount = (classes, studentKey, expectedCount) => {
  const studentClasses = classes[studentKey] || [];
  expect(studentClasses.length).toBe(expectedCount);
};

export const expectScheduleCount = (schedules, studentKey, expectedCount) => {
  const studentSchedules = schedules[studentKey] || [];
  expect(studentSchedules.length).toBe(expectedCount);
};

export default {
  mockStudents,
  mockPrices,
  mockSchedule,
  mockClass,
  mockSchedules,
  mockClasses,
  createDate,
  formatTestDate,
  formatTestTime,
  daysOfWeek,
  getDayName,
  calculateExpectedClasses,
  flushPromises,
  waitForAsyncUpdates,
  setupMockStorage,
  testIds,
  pressAlertButton,
  generateId,
  getMonthString,
  getCurrentMonthString,
  expectClassCount,
  expectScheduleCount,
};
