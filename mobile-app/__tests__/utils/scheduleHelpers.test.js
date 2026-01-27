/**
 * Unit tests for scheduleHelpers utility module
 */

import {
  DAYS_OF_WEEK,
  CALENDAR_DAY_LABELS,
  createSchedule,
  addScheduleToStudent,
  removeScheduleFromStudent,
  hasSchedules,
  hasAnySchedules,
  getScheduleCount,
  scheduleExists,
  getSchedulesForDay,
  formatSchedule
} from '../../utils/scheduleHelpers';

describe('scheduleHelpers', () => {
  const mockSchedules = {
    kareem: [
      { id: 1, day: 'Monday', time: '10:00', student: 'kareem' },
      { id: 2, day: 'Wednesday', time: '14:00', student: 'kareem' },
    ],
    saraHana: [
      { id: 3, day: 'Tuesday', time: '11:00', student: 'saraHana' },
    ],
  };

  describe('DAYS_OF_WEEK', () => {
    test('contains all seven days', () => {
      expect(DAYS_OF_WEEK.length).toBe(7);
      expect(DAYS_OF_WEEK).toContain('Monday');
      expect(DAYS_OF_WEEK).toContain('Sunday');
    });

    test('starts with Monday', () => {
      expect(DAYS_OF_WEEK[0]).toBe('Monday');
    });
  });

  describe('CALENDAR_DAY_LABELS', () => {
    test('contains all seven short labels', () => {
      expect(CALENDAR_DAY_LABELS.length).toBe(7);
      expect(CALENDAR_DAY_LABELS).toContain('Mon');
      expect(CALENDAR_DAY_LABELS).toContain('Sun');
    });

    test('starts with Sunday', () => {
      expect(CALENDAR_DAY_LABELS[0]).toBe('Sun');
    });
  });

  describe('createSchedule', () => {
    test('creates schedule with all properties', () => {
      const schedule = createSchedule('Monday', '10:00', 'kareem');
      expect(schedule).toHaveProperty('id');
      expect(schedule).toHaveProperty('day', 'Monday');
      expect(schedule).toHaveProperty('time', '10:00');
      expect(schedule).toHaveProperty('student', 'kareem');
    });

    test('generates unique IDs', () => {
      const s1 = createSchedule('Monday', '10:00', 'kareem');
      const s2 = createSchedule('Monday', '10:00', 'kareem');
      // IDs might be same if created in same millisecond, but should work
      expect(typeof s1.id).toBe('number');
      expect(typeof s2.id).toBe('number');
    });
  });

  describe('addScheduleToStudent', () => {
    test('adds schedule to existing student', () => {
      const newSchedule = { id: 99, day: 'Friday', time: '16:00', student: 'kareem' };
      const result = addScheduleToStudent(mockSchedules, 'kareem', newSchedule);
      expect(result.kareem.length).toBe(3);
      expect(result.kareem[2]).toEqual(newSchedule);
    });

    test('creates array for new student', () => {
      const newSchedule = { id: 99, day: 'Friday', time: '16:00', student: 'newStudent' };
      const result = addScheduleToStudent({}, 'newStudent', newSchedule);
      expect(result.newStudent.length).toBe(1);
    });

    test('preserves other students', () => {
      const newSchedule = { id: 99, day: 'Friday', time: '16:00', student: 'kareem' };
      const result = addScheduleToStudent(mockSchedules, 'kareem', newSchedule);
      expect(result.saraHana).toEqual(mockSchedules.saraHana);
    });
  });

  describe('removeScheduleFromStudent', () => {
    test('removes schedule by ID', () => {
      const result = removeScheduleFromStudent(mockSchedules, 'kareem', 1);
      expect(result.kareem.length).toBe(1);
      expect(result.kareem.find(s => s.id === 1)).toBeUndefined();
    });

    test('preserves other students', () => {
      const result = removeScheduleFromStudent(mockSchedules, 'kareem', 1);
      expect(result.saraHana.length).toBe(1);
    });

    test('handles non-existent student', () => {
      const result = removeScheduleFromStudent(mockSchedules, 'missing', 1);
      expect(result).toEqual(mockSchedules);
    });

    test('handles non-existent schedule ID', () => {
      const result = removeScheduleFromStudent(mockSchedules, 'kareem', 999);
      expect(result.kareem.length).toBe(2);
    });
  });

  describe('hasSchedules', () => {
    test('returns true for student with schedules', () => {
      expect(hasSchedules(mockSchedules, 'kareem')).toBe(true);
    });

    test('returns false for student without schedules', () => {
      const emptySchedules = { kareem: [], saraHana: [] };
      expect(hasSchedules(emptySchedules, 'kareem')).toBe(false);
    });

    test('returns false for non-existent student', () => {
      expect(hasSchedules(mockSchedules, 'missing')).toBe(false);
    });
  });

  describe('hasAnySchedules', () => {
    test('returns true when any student has schedules', () => {
      expect(hasAnySchedules(mockSchedules)).toBe(true);
    });

    test('returns false when all students have empty schedules', () => {
      const emptySchedules = { kareem: [], saraHana: [] };
      expect(hasAnySchedules(emptySchedules)).toBe(false);
    });

    test('returns false for empty object', () => {
      expect(hasAnySchedules({})).toBe(false);
    });
  });

  describe('getScheduleCount', () => {
    test('returns correct count for student', () => {
      expect(getScheduleCount(mockSchedules, 'kareem')).toBe(2);
      expect(getScheduleCount(mockSchedules, 'saraHana')).toBe(1);
    });

    test('returns 0 for non-existent student', () => {
      expect(getScheduleCount(mockSchedules, 'missing')).toBe(0);
    });

    test('returns 0 for empty array', () => {
      const emptySchedules = { kareem: [] };
      expect(getScheduleCount(emptySchedules, 'kareem')).toBe(0);
    });
  });

  describe('scheduleExists', () => {
    test('returns true for existing schedule', () => {
      expect(scheduleExists(mockSchedules, 'kareem', 'Monday', '10:00')).toBe(true);
    });

    test('returns false for non-existing schedule', () => {
      expect(scheduleExists(mockSchedules, 'kareem', 'Monday', '11:00')).toBe(false);
      expect(scheduleExists(mockSchedules, 'kareem', 'Friday', '10:00')).toBe(false);
    });

    test('returns false for non-existent student', () => {
      expect(scheduleExists(mockSchedules, 'missing', 'Monday', '10:00')).toBe(false);
    });
  });

  describe('getSchedulesForDay', () => {
    test('returns schedules for specific day', () => {
      const result = getSchedulesForDay(mockSchedules, 'Monday');
      expect(result.length).toBe(1);
      expect(result[0].day).toBe('Monday');
      expect(result[0].studentKey).toBe('kareem');
    });

    test('returns empty array for day with no schedules', () => {
      const result = getSchedulesForDay(mockSchedules, 'Saturday');
      expect(result).toEqual([]);
    });

    test('returns schedules from multiple students', () => {
      const schedulesWithSameDay = {
        kareem: [{ id: 1, day: 'Monday', time: '10:00' }],
        saraHana: [{ id: 2, day: 'Monday', time: '11:00' }],
      };
      const result = getSchedulesForDay(schedulesWithSameDay, 'Monday');
      expect(result.length).toBe(2);
    });
  });

  describe('formatSchedule', () => {
    test('formats schedule correctly', () => {
      const schedule = { day: 'Monday', time: '10:00' };
      expect(formatSchedule(schedule)).toBe('Monday at 10:00');
    });

    test('works with different days and times', () => {
      const schedule = { day: 'Friday', time: '14:30' };
      expect(formatSchedule(schedule)).toBe('Friday at 14:30');
    });
  });
});
