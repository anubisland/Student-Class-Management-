/**
 * Unit tests for classHelpers utility module
 */

import {
  getMonthlyClasses,
  getStudentStats,
  classExists,
  createClass,
  generateClassesForMonth,
  removeClass,
  addClassToStudent,
  calculateMonthlyTotals
} from '../../utils/classHelpers';

describe('classHelpers', () => {
  const mockClasses = {
    kareem: [
      { id: '1', date: '2025-01-06', time: '10:00' },
      { id: '2', date: '2025-01-08', time: '14:00' },
      { id: '3', date: '2025-01-13', time: '10:00' },
      { id: '4', date: '2025-02-03', time: '10:00' },
    ],
    saraHana: [
      { id: '5', date: '2025-01-07', time: '11:00' },
      { id: '6', date: '2025-01-09', time: '15:00' },
    ],
  };

  const mockPrices = {
    kareem: '25.00',
    saraHana: '30.00',
  };

  describe('getMonthlyClasses', () => {
    test('filters classes by month correctly', () => {
      const result = getMonthlyClasses('kareem', '2025-01', mockClasses);
      expect(result.length).toBe(3);
    });

    test('returns empty array for month with no classes', () => {
      const result = getMonthlyClasses('kareem', '2025-03', mockClasses);
      expect(result.length).toBe(0);
    });

    test('returns empty array for non-existent student', () => {
      const result = getMonthlyClasses('unknown', '2025-01', mockClasses);
      expect(result.length).toBe(0);
    });

    test('sorts classes in descending order (newest first)', () => {
      const result = getMonthlyClasses('kareem', '2025-01', mockClasses);
      expect(result[0].date).toBe('2025-01-13');
      expect(result[2].date).toBe('2025-01-06');
    });

    test('handles null classes object', () => {
      const result = getMonthlyClasses('kareem', '2025-01', null);
      expect(result).toEqual([]);
    });

    test('handles missing student in classes', () => {
      const result = getMonthlyClasses('missing', '2025-01', mockClasses);
      expect(result).toEqual([]);
    });
  });

  describe('getStudentStats', () => {
    test('calculates correct stats for Kareem in January', () => {
      const stats = getStudentStats('kareem', '2025-01', mockClasses, mockPrices);
      expect(stats.classCount).toBe(3);
      expect(stats.total).toBe(75); // 3 * $25
      expect(stats.classes.length).toBe(3);
    });

    test('calculates correct stats for Sara_Hana in January', () => {
      const stats = getStudentStats('saraHana', '2025-01', mockClasses, mockPrices);
      expect(stats.classCount).toBe(2);
      expect(stats.total).toBe(60); // 2 * $30
    });

    test('returns zero for month with no classes', () => {
      const stats = getStudentStats('kareem', '2025-03', mockClasses, mockPrices);
      expect(stats.classCount).toBe(0);
      expect(stats.total).toBe(0);
    });

    test('handles missing price (defaults to 0)', () => {
      const pricesWithMissing = { kareem: '25.00' };
      const stats = getStudentStats('saraHana', '2025-01', mockClasses, pricesWithMissing);
      expect(stats.classCount).toBe(2);
      expect(stats.total).toBe(0);
    });

    test('handles invalid price string', () => {
      const invalidPrices = { kareem: 'invalid' };
      const stats = getStudentStats('kareem', '2025-01', mockClasses, invalidPrices);
      expect(stats.classCount).toBe(3);
      expect(stats.total).toBe(0);
    });
  });

  describe('classExists', () => {
    const existingClasses = [
      { date: '2025-01-06', time: '10:00' },
      { date: '2025-01-08', time: '14:00' },
    ];

    test('returns true for existing class', () => {
      expect(classExists(existingClasses, '2025-01-06', '10:00')).toBe(true);
    });

    test('returns false for non-existing class', () => {
      expect(classExists(existingClasses, '2025-01-06', '11:00')).toBe(false);
      expect(classExists(existingClasses, '2025-01-07', '10:00')).toBe(false);
    });

    test('handles empty array', () => {
      expect(classExists([], '2025-01-06', '10:00')).toBe(false);
    });

    test('handles null/undefined', () => {
      expect(classExists(null, '2025-01-06', '10:00')).toBe(false);
      expect(classExists(undefined, '2025-01-06', '10:00')).toBe(false);
    });
  });

  describe('createClass', () => {
    test('creates class with all required properties', () => {
      const cls = createClass('2025-01-15', '14:30', 'kareem', false);
      expect(cls).toHaveProperty('id');
      expect(cls).toHaveProperty('date', '2025-01-15');
      expect(cls).toHaveProperty('time', '14:30');
      expect(cls).toHaveProperty('student', 'kareem');
      expect(cls).toHaveProperty('timestamp');
      expect(cls).toHaveProperty('generated', false);
    });

    test('creates generated class with complex ID', () => {
      const cls = createClass('2025-01-15', '14:30', 'kareem', true);
      expect(cls.generated).toBe(true);
      expect(typeof cls.id).toBe('string');
      expect(cls.id).toContain('class_kareem');
    });

    test('creates manual class with numeric ID', () => {
      const cls = createClass('2025-01-15', '14:30', 'kareem', false);
      expect(cls.generated).toBe(false);
      expect(typeof cls.id).toBe('number');
    });
  });

  describe('generateClassesForMonth', () => {
    const schedules = [
      { day: 'Monday', time: '10:00' },
      { day: 'Wednesday', time: '14:00' },
    ];

    test('generates classes for schedules', () => {
      const result = generateClassesForMonth('kareem', schedules, '2025-01', []);
      expect(result.count).toBeGreaterThan(0);
      expect(result.newClasses.length).toBe(result.count);
    });

    test('returns empty when no schedules', () => {
      const result = generateClassesForMonth('kareem', [], '2025-01', []);
      expect(result.count).toBe(0);
      expect(result.newClasses).toEqual([]);
    });

    test('skips existing classes (no duplicates)', () => {
      const existingClasses = [
        { date: '2025-01-06', time: '10:00' }, // First Monday in Jan 2025
      ];
      const result = generateClassesForMonth('kareem', schedules, '2025-01', existingClasses);
      const hasJan6 = result.newClasses.some(c => c.date === '2025-01-06' && c.time === '10:00');
      expect(hasJan6).toBe(false);
    });

    test('handles null schedules', () => {
      const result = generateClassesForMonth('kareem', null, '2025-01', []);
      expect(result.count).toBe(0);
    });

    test('generates classes for correct days', () => {
      const mondayOnly = [{ day: 'Monday', time: '10:00' }];
      const result = generateClassesForMonth('kareem', mondayOnly, '2025-01', []);
      // January 2025 has 4 Mondays: 6, 13, 20, 27
      expect(result.count).toBe(4);
      const expectedDates = ['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27'];
      result.newClasses.forEach(cls => {
        expect(expectedDates).toContain(cls.date);
      });
    });
  });

  describe('removeClass', () => {
    test('removes class by ID', () => {
      const result = removeClass(mockClasses, 'kareem', '1');
      expect(result.kareem.length).toBe(3);
      expect(result.kareem.find(c => c.id === '1')).toBeUndefined();
    });

    test('preserves other students', () => {
      const result = removeClass(mockClasses, 'kareem', '1');
      expect(result.saraHana.length).toBe(2);
    });

    test('handles non-existent student', () => {
      const result = removeClass(mockClasses, 'missing', '1');
      expect(result).toEqual(mockClasses);
    });

    test('handles non-existent class ID', () => {
      const result = removeClass(mockClasses, 'kareem', '999');
      expect(result.kareem.length).toBe(4);
    });
  });

  describe('addClassToStudent', () => {
    test('adds class to existing student', () => {
      const newClass = { id: '99', date: '2025-01-20', time: '16:00' };
      const result = addClassToStudent(mockClasses, 'kareem', newClass);
      expect(result.kareem.length).toBe(5);
      expect(result.kareem[result.kareem.length - 1]).toEqual(newClass);
    });

    test('creates array for new student', () => {
      const newClass = { id: '99', date: '2025-01-20', time: '16:00' };
      const result = addClassToStudent({}, 'newStudent', newClass);
      expect(result.newStudent.length).toBe(1);
    });

    test('preserves other students', () => {
      const newClass = { id: '99', date: '2025-01-20', time: '16:00' };
      const result = addClassToStudent(mockClasses, 'kareem', newClass);
      expect(result.saraHana).toEqual(mockClasses.saraHana);
    });
  });

  describe('calculateMonthlyTotals', () => {
    const students = [
      { key: 'kareem', name: 'Kareem' },
      { key: 'saraHana', name: 'Sara_Hana' },
    ];

    test('calculates combined totals', () => {
      const result = calculateMonthlyTotals(students, '2025-01', mockClasses, mockPrices);
      expect(result.totalClasses).toBe(5); // 3 + 2
      expect(result.totalRevenue).toBe(135); // 75 + 60
    });

    test('returns zero for empty month', () => {
      const result = calculateMonthlyTotals(students, '2025-03', mockClasses, mockPrices);
      expect(result.totalClasses).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });
  });
});
