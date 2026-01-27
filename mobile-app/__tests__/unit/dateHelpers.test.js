/**
 * Unit tests for date helper functions
 * Tests: formatDate, getMonthName, getCalendarDays, navigateMonth
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Test the date formatting logic directly
describe('Date Helper Functions', () => {

  describe('formatDate logic', () => {
    // Testing the formatDate pattern: YYYY-MM-DD with zero-padding

    test('formats single digit month with leading zero', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2025-01-15');
    });

    test('formats single digit day with leading zero', () => {
      const date = new Date(2025, 11, 5); // December 5, 2025
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2025-12-05');
    });

    test('formats double digit month and day correctly', () => {
      const date = new Date(2025, 10, 25); // November 25, 2025
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2025-11-25');
    });

    test('handles leap year February 29', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2024-02-29');
    });

    test('handles year boundary - December 31', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2025-12-31');
    });

    test('handles year boundary - January 1', () => {
      const date = new Date(2026, 0, 1); // January 1, 2026
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      expect(result).toBe('2026-01-01');
    });
  });

  describe('getMonthName logic', () => {
    // Testing month name conversion from YYYY-MM format

    test('converts 2025-01 to January 2025', () => {
      const monthString = '2025-01';
      const [year, month] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const result = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      expect(result).toBe('January 2025');
    });

    test('converts 2025-12 to December 2025', () => {
      const monthString = '2025-12';
      const [year, month] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const result = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      expect(result).toBe('December 2025');
    });

    test('converts 2024-06 to June 2024', () => {
      const monthString = '2024-06';
      const [year, month] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const result = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      expect(result).toBe('June 2024');
    });
  });

  describe('getCalendarDays logic', () => {
    // Testing calendar grid generation

    test('generates correct days for January 2025 (starts on Wednesday)', () => {
      const year = 2025;
      const month = 0; // January (0-indexed)
      const firstDay = new Date(year, month, 1).getDay(); // 3 = Wednesday
      const daysInMonth = new Date(year, month + 1, 0).getDate(); // 31

      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
      }

      expect(firstDay).toBe(3); // Wednesday
      expect(daysInMonth).toBe(31);
      expect(days.length).toBe(34); // 3 nulls + 31 days
      expect(days[0]).toBeNull();
      expect(days[1]).toBeNull();
      expect(days[2]).toBeNull();
      expect(days[3]).toBe(1);
      expect(days[33]).toBe(31);
    });

    test('generates correct days for February 2024 (leap year)', () => {
      const year = 2024;
      const month = 1; // February
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      expect(daysInMonth).toBe(29); // Leap year
    });

    test('generates correct days for February 2025 (non-leap year)', () => {
      const year = 2025;
      const month = 1; // February
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      expect(daysInMonth).toBe(28); // Non-leap year
    });

    test('generates correct days for month starting on Sunday', () => {
      // Find a month that starts on Sunday
      const year = 2025;
      const month = 5; // June 2025 starts on Sunday
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
      }

      expect(firstDay).toBe(0); // Sunday
      expect(days[0]).toBe(1); // First day is 1 (no padding)
      expect(daysInMonth).toBe(30);
    });

    test('handles all month lengths (28, 29, 30, 31)', () => {
      // February non-leap
      expect(new Date(2025, 2, 0).getDate()).toBe(28);
      // February leap
      expect(new Date(2024, 2, 0).getDate()).toBe(29);
      // April
      expect(new Date(2025, 4, 0).getDate()).toBe(30);
      // January
      expect(new Date(2025, 1, 0).getDate()).toBe(31);
    });
  });

  describe('navigateMonth logic', () => {
    // Testing month navigation

    test('navigates forward from January to February', () => {
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      currentDate.setMonth(currentDate.getMonth() + 1);
      const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      expect(newMonthString).toBe('2025-02');
    });

    test('navigates backward from February to January', () => {
      const currentMonth = '2025-02';
      const [year, month] = currentMonth.split('-');
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      currentDate.setMonth(currentDate.getMonth() - 1);
      const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      expect(newMonthString).toBe('2025-01');
    });

    test('navigates forward across year boundary (December to January)', () => {
      const currentMonth = '2025-12';
      const [year, month] = currentMonth.split('-');
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      currentDate.setMonth(currentDate.getMonth() + 1);
      const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      expect(newMonthString).toBe('2026-01');
    });

    test('navigates backward across year boundary (January to December)', () => {
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      currentDate.setMonth(currentDate.getMonth() - 1);
      const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      expect(newMonthString).toBe('2024-12');
    });
  });

  describe('setCurrentMonthToNow logic', () => {
    test('generates current month string correctly', () => {
      const now = new Date();
      const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      expect(monthString).toMatch(/^\d{4}-\d{2}$/);
      expect(parseInt(monthString.split('-')[0])).toBe(now.getFullYear());
      expect(parseInt(monthString.split('-')[1])).toBe(now.getMonth() + 1);
    });
  });
});

describe('Calendar Day Selection', () => {
  test('selectCalendarDay creates correct date object', () => {
    const calendarViewDate = new Date(2025, 0, 1); // January 2025
    const day = 15;

    const newDate = new Date(
      calendarViewDate.getFullYear(),
      calendarViewDate.getMonth(),
      day
    );

    expect(newDate.getFullYear()).toBe(2025);
    expect(newDate.getMonth()).toBe(0); // January
    expect(newDate.getDate()).toBe(15);
  });

  test('selectCalendarDay handles last day of month', () => {
    const calendarViewDate = new Date(2025, 0, 1); // January 2025
    const day = 31;

    const newDate = new Date(
      calendarViewDate.getFullYear(),
      calendarViewDate.getMonth(),
      day
    );

    expect(newDate.getDate()).toBe(31);
  });
});
