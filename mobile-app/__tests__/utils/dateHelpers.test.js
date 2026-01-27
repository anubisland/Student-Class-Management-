/**
 * Unit tests for dateHelpers utility module
 */

import {
  formatDate,
  getMonthName,
  getCurrentMonthString,
  navigateMonthString,
  getCalendarDays,
  getDaysInMonth,
  isLeapYear,
  getDayOfWeek,
  getAvailableMonths
} from '../../utils/dateHelpers';

describe('dateHelpers', () => {
  describe('formatDate', () => {
    test('formats date correctly with single digit day and month', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      expect(formatDate(date)).toBe('2025-01-05');
    });

    test('formats date correctly with double digit day and month', () => {
      const date = new Date(2025, 11, 25); // December 25, 2025
      expect(formatDate(date)).toBe('2025-12-25');
    });

    test('formats first day of year', () => {
      const date = new Date(2025, 0, 1);
      expect(formatDate(date)).toBe('2025-01-01');
    });

    test('formats last day of year', () => {
      const date = new Date(2025, 11, 31);
      expect(formatDate(date)).toBe('2025-12-31');
    });

    test('formats leap year date', () => {
      const date = new Date(2024, 1, 29); // Feb 29, 2024
      expect(formatDate(date)).toBe('2024-02-29');
    });
  });

  describe('getMonthName', () => {
    test('converts January correctly', () => {
      expect(getMonthName('2025-01')).toBe('January 2025');
    });

    test('converts June correctly', () => {
      expect(getMonthName('2025-06')).toBe('June 2025');
    });

    test('converts December correctly', () => {
      expect(getMonthName('2025-12')).toBe('December 2025');
    });

    test('handles different years', () => {
      expect(getMonthName('2024-03')).toBe('March 2024');
      expect(getMonthName('2026-09')).toBe('September 2026');
    });
  });

  describe('getCurrentMonthString', () => {
    test('returns current month in YYYY-MM format', () => {
      const result = getCurrentMonthString();
      expect(result).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('navigateMonthString', () => {
    test('navigates forward one month', () => {
      expect(navigateMonthString('2025-01', 1)).toBe('2025-02');
      expect(navigateMonthString('2025-06', 1)).toBe('2025-07');
    });

    test('navigates backward one month', () => {
      expect(navigateMonthString('2025-02', -1)).toBe('2025-01');
      expect(navigateMonthString('2025-06', -1)).toBe('2025-05');
    });

    test('handles year boundary forward', () => {
      expect(navigateMonthString('2025-12', 1)).toBe('2026-01');
    });

    test('handles year boundary backward', () => {
      expect(navigateMonthString('2025-01', -1)).toBe('2024-12');
    });

    test('navigates multiple months', () => {
      expect(navigateMonthString('2025-01', 6)).toBe('2025-07');
      expect(navigateMonthString('2025-06', -6)).toBe('2024-12');
    });
  });

  describe('getCalendarDays', () => {
    test('generates correct days for January 2025', () => {
      const days = getCalendarDays(2025, 0); // January
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(31);
      expect(actualDays[0]).toBe(1);
      expect(actualDays[actualDays.length - 1]).toBe(31);
    });

    test('generates correct days for February 2024 (leap year)', () => {
      const days = getCalendarDays(2024, 1); // February
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(29);
    });

    test('generates correct days for February 2025 (non-leap year)', () => {
      const days = getCalendarDays(2025, 1); // February
      const actualDays = days.filter(d => d !== null);
      expect(actualDays.length).toBe(28);
    });

    test('includes padding for first week', () => {
      const days = getCalendarDays(2025, 0); // January 2025 starts on Wednesday
      // Check that there are nulls at the beginning
      const firstDayIndex = days.findIndex(d => d === 1);
      expect(firstDayIndex).toBeGreaterThanOrEqual(0);
    });

    test('days are in sequential order', () => {
      const days = getCalendarDays(2025, 5); // June
      const actualDays = days.filter(d => d !== null);
      for (let i = 0; i < actualDays.length - 1; i++) {
        expect(actualDays[i + 1]).toBe(actualDays[i] + 1);
      }
    });
  });

  describe('getDaysInMonth', () => {
    test('returns 31 for January', () => {
      expect(getDaysInMonth(2025, 1)).toBe(31);
    });

    test('returns 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2025, 2)).toBe(28);
    });

    test('returns 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    test('returns 30 for April', () => {
      expect(getDaysInMonth(2025, 4)).toBe(30);
    });

    test('returns 31 for December', () => {
      expect(getDaysInMonth(2025, 12)).toBe(31);
    });
  });

  describe('isLeapYear', () => {
    test('returns true for divisible by 4', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
    });

    test('returns false for divisible by 100 but not 400', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });

    test('returns true for divisible by 400', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
    });

    test('returns false for non-leap years', () => {
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2023)).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    test('returns correct day name', () => {
      const monday = new Date(2025, 0, 6); // Jan 6, 2025 is Monday
      expect(getDayOfWeek(monday)).toBe('Monday');

      const sunday = new Date(2025, 0, 5); // Jan 5, 2025 is Sunday
      expect(getDayOfWeek(sunday)).toBe('Sunday');

      const wednesday = new Date(2025, 0, 1); // Jan 1, 2025 is Wednesday
      expect(getDayOfWeek(wednesday)).toBe('Wednesday');
    });
  });

  describe('getAvailableMonths', () => {
    test('returns at least 12 months', () => {
      const months = getAvailableMonths({});
      expect(months.length).toBeGreaterThanOrEqual(12);
    });

    test('includes months from existing classes', () => {
      const classes = {
        kareem: [{ date: '2024-06-15' }]
      };
      const months = getAvailableMonths(classes);
      expect(months).toContain('2024-06');
    });

    test('returns months in sorted order', () => {
      const months = getAvailableMonths({});
      for (let i = 0; i < months.length - 1; i++) {
        expect(months[i].localeCompare(months[i + 1])).toBeLessThan(0);
      }
    });

    test('handles empty classes object', () => {
      const months = getAvailableMonths({});
      expect(months.length).toBeGreaterThanOrEqual(12);
    });

    test('handles null/undefined in classes', () => {
      const classes = {
        kareem: null,
        saraHana: undefined
      };
      const months = getAvailableMonths(classes);
      expect(months.length).toBeGreaterThanOrEqual(12);
    });
  });
});
