/**
 * Unit tests for timeHelpers utility module
 */

import {
  incrementHour,
  incrementMinute,
  formatTime,
  parseTime,
  isValidTimeString,
  compareTime,
  QUICK_MINUTES,
  getNearestQuickMinute
} from '../../utils/timeHelpers';

describe('timeHelpers', () => {
  describe('incrementHour', () => {
    test('increments hour normally', () => {
      expect(incrementHour(10, 1)).toBe(11);
      expect(incrementHour(0, 5)).toBe(5);
    });

    test('decrements hour normally', () => {
      expect(incrementHour(10, -1)).toBe(9);
      expect(incrementHour(5, -3)).toBe(2);
    });

    test('wraps at 24 going forward', () => {
      expect(incrementHour(23, 1)).toBe(0);
      expect(incrementHour(22, 3)).toBe(1);
    });

    test('wraps at 0 going backward', () => {
      expect(incrementHour(0, -1)).toBe(23);
      expect(incrementHour(2, -5)).toBe(21);
    });

    test('handles large increments', () => {
      expect(incrementHour(10, 24)).toBe(10);
      expect(incrementHour(10, 25)).toBe(11);
    });

    test('handles large decrements', () => {
      expect(incrementHour(10, -24)).toBe(10);
      expect(incrementHour(10, -25)).toBe(9);
    });
  });

  describe('incrementMinute', () => {
    test('increments minute normally', () => {
      expect(incrementMinute(30, 5)).toBe(35);
      expect(incrementMinute(0, 15)).toBe(15);
    });

    test('decrements minute normally', () => {
      expect(incrementMinute(30, -5)).toBe(25);
      expect(incrementMinute(15, -10)).toBe(5);
    });

    test('wraps at 60 going forward', () => {
      expect(incrementMinute(55, 5)).toBe(0);
      expect(incrementMinute(50, 15)).toBe(5);
    });

    test('wraps at 0 going backward', () => {
      expect(incrementMinute(0, -5)).toBe(55);
      expect(incrementMinute(5, -10)).toBe(55);
    });

    test('handles large increments', () => {
      expect(incrementMinute(30, 60)).toBe(30);
      expect(incrementMinute(30, 65)).toBe(35);
    });

    test('handles large decrements', () => {
      expect(incrementMinute(30, -60)).toBe(30);
      expect(incrementMinute(30, -65)).toBe(25);
    });
  });

  describe('formatTime', () => {
    test('formats time with double digits', () => {
      expect(formatTime(14, 30)).toBe('14:30');
      expect(formatTime(10, 45)).toBe('10:45');
    });

    test('pads single digit hour', () => {
      expect(formatTime(9, 30)).toBe('09:30');
      expect(formatTime(0, 15)).toBe('00:15');
    });

    test('pads single digit minute', () => {
      expect(formatTime(14, 5)).toBe('14:05');
      expect(formatTime(10, 0)).toBe('10:00');
    });

    test('pads both hour and minute', () => {
      expect(formatTime(5, 5)).toBe('05:05');
      expect(formatTime(0, 0)).toBe('00:00');
    });

    test('formats midnight correctly', () => {
      expect(formatTime(0, 0)).toBe('00:00');
    });

    test('formats last minute of day', () => {
      expect(formatTime(23, 59)).toBe('23:59');
    });
  });

  describe('parseTime', () => {
    test('parses valid time string', () => {
      expect(parseTime('14:30')).toEqual({ hour: 14, minute: 30 });
      expect(parseTime('09:05')).toEqual({ hour: 9, minute: 5 });
    });

    test('parses midnight', () => {
      expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
    });

    test('parses end of day', () => {
      expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
    });
  });

  describe('isValidTimeString', () => {
    test('returns true for valid times', () => {
      expect(isValidTimeString('00:00')).toBe(true);
      expect(isValidTimeString('14:30')).toBe(true);
      expect(isValidTimeString('23:59')).toBe(true);
      expect(isValidTimeString('9:30')).toBe(true);
    });

    test('returns false for invalid hours', () => {
      expect(isValidTimeString('24:00')).toBe(false);
      expect(isValidTimeString('25:30')).toBe(false);
    });

    test('returns false for invalid minutes', () => {
      expect(isValidTimeString('14:60')).toBe(false);
      expect(isValidTimeString('14:75')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isValidTimeString(null)).toBe(false);
      expect(isValidTimeString(undefined)).toBe(false);
    });

    test('returns false for non-string', () => {
      expect(isValidTimeString(1430)).toBe(false);
      expect(isValidTimeString({ hour: 14, minute: 30 })).toBe(false);
    });

    test('returns false for malformed strings', () => {
      expect(isValidTimeString('14-30')).toBe(false);
      expect(isValidTimeString('14:30:00')).toBe(false);
      expect(isValidTimeString('abc')).toBe(false);
    });
  });

  describe('compareTime', () => {
    test('returns negative when time1 < time2', () => {
      expect(compareTime('09:00', '10:00')).toBeLessThan(0);
      expect(compareTime('10:00', '10:30')).toBeLessThan(0);
    });

    test('returns positive when time1 > time2', () => {
      expect(compareTime('10:00', '09:00')).toBeGreaterThan(0);
      expect(compareTime('10:30', '10:00')).toBeGreaterThan(0);
    });

    test('returns 0 when times are equal', () => {
      expect(compareTime('10:00', '10:00')).toBe(0);
      expect(compareTime('14:30', '14:30')).toBe(0);
    });
  });

  describe('QUICK_MINUTES', () => {
    test('contains expected values', () => {
      expect(QUICK_MINUTES).toEqual([0, 15, 30, 45]);
    });
  });

  describe('getNearestQuickMinute', () => {
    test('returns exact match', () => {
      expect(getNearestQuickMinute(0)).toBe(0);
      expect(getNearestQuickMinute(15)).toBe(15);
      expect(getNearestQuickMinute(30)).toBe(30);
      expect(getNearestQuickMinute(45)).toBe(45);
    });

    test('rounds to nearest quick minute', () => {
      expect(getNearestQuickMinute(7)).toBe(0);
      expect(getNearestQuickMinute(8)).toBe(15);
      expect(getNearestQuickMinute(22)).toBe(15);
      expect(getNearestQuickMinute(23)).toBe(30);
      expect(getNearestQuickMinute(37)).toBe(30);
      expect(getNearestQuickMinute(38)).toBe(45);
      expect(getNearestQuickMinute(52)).toBe(45);
      expect(getNearestQuickMinute(53)).toBe(45);
    });
  });
});
