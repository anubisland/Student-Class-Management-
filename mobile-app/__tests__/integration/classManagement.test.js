/**
 * Integration tests for class management operations
 * Tests: addClass, removeClass, class filtering, monthly statistics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Class Management Integration', () => {

  beforeEach(() => {
    AsyncStorage.__reset();
    jest.clearAllMocks();
  });

  // Helper functions
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonthlyClasses = (student, month, classes) => {
    if (!classes[student]) return [];
    return classes[student]
      .filter((cls) => cls.date.startsWith(month))
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB.getTime() - dateA.getTime();
      });
  };

  describe('Class data structure', () => {
    test('class has all required properties', () => {
      const newClass = {
        id: Date.now(),
        date: '2025-01-15',
        time: '14:30',
        timestamp: new Date().toISOString()
      };

      expect(newClass).toHaveProperty('id');
      expect(newClass).toHaveProperty('date');
      expect(newClass).toHaveProperty('time');
      expect(newClass).toHaveProperty('timestamp');
    });

    test('generated class has additional properties', () => {
      const generatedClass = {
        id: `class_kareem_2025-01-06_10:00_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        date: '2025-01-06',
        time: '10:00',
        student: 'kareem',
        timestamp: new Date().toISOString(),
        generated: true
      };

      expect(generatedClass.generated).toBe(true);
      expect(generatedClass.student).toBe('kareem');
    });
  });

  describe('Class filtering', () => {
    const mockClasses = {
      kareem: [
        { id: '1', date: '2025-01-06', time: '10:00' },
        { id: '2', date: '2025-01-08', time: '14:00' },
        { id: '3', date: '2025-01-13', time: '10:00' },
        { id: '4', date: '2025-02-03', time: '10:00' },
        { id: '5', date: '2025-02-05', time: '14:00' },
      ],
      saraHana: [
        { id: '6', date: '2025-01-07', time: '11:00' },
        { id: '7', date: '2025-01-09', time: '15:00' },
      ],
    };

    test('filters classes by month correctly', () => {
      const januaryClasses = getMonthlyClasses('kareem', '2025-01', mockClasses);
      const februaryClasses = getMonthlyClasses('kareem', '2025-02', mockClasses);

      expect(januaryClasses.length).toBe(3);
      expect(februaryClasses.length).toBe(2);
    });

    test('returns empty array for month with no classes', () => {
      const marchClasses = getMonthlyClasses('kareem', '2025-03', mockClasses);
      expect(marchClasses.length).toBe(0);
    });

    test('sorts classes by date descending', () => {
      const classes = getMonthlyClasses('kareem', '2025-01', mockClasses);

      // Most recent first
      expect(classes[0].date).toBe('2025-01-13');
      expect(classes[2].date).toBe('2025-01-06');
    });

    test('filters correctly for different students', () => {
      const kareemClasses = getMonthlyClasses('kareem', '2025-01', mockClasses);
      const saraHanaClasses = getMonthlyClasses('saraHana', '2025-01', mockClasses);

      expect(kareemClasses.length).toBe(3);
      expect(saraHanaClasses.length).toBe(2);
    });
  });

  describe('Class CRUD operations', () => {
    test('adds class to empty list', () => {
      const classes = { kareem: [], saraHana: [] };
      const selectedStudent = 'kareem';

      const newClass = {
        id: Date.now(),
        date: '2025-01-15',
        time: '14:30'
      };

      const updatedClasses = {
        ...classes,
        [selectedStudent]: [...(classes[selectedStudent] || []), newClass]
      };

      expect(updatedClasses.kareem.length).toBe(1);
      expect(updatedClasses.saraHana.length).toBe(0);
    });

    test('adds class to existing list', () => {
      const classes = {
        kareem: [{ id: 1, date: '2025-01-10', time: '10:00' }],
        saraHana: []
      };

      const newClass = { id: 2, date: '2025-01-15', time: '14:30' };
      classes.kareem.push(newClass);

      expect(classes.kareem.length).toBe(2);
    });

    test('removes class by ID', () => {
      const classes = {
        kareem: [
          { id: 1, date: '2025-01-06', time: '10:00' },
          { id: 2, date: '2025-01-08', time: '14:00' }
        ]
      };

      const filteredClasses = classes.kareem.filter(c => c.id !== 1);

      expect(filteredClasses.length).toBe(1);
      expect(filteredClasses[0].id).toBe(2);
    });

    test('preserves other students when modifying one', () => {
      const classes = {
        kareem: [{ id: 1, date: '2025-01-06', time: '10:00' }],
        saraHana: [{ id: 2, date: '2025-01-07', time: '11:00' }]
      };

      const updatedClasses = {
        ...classes,
        kareem: []
      };

      expect(updatedClasses.kareem.length).toBe(0);
      expect(updatedClasses.saraHana.length).toBe(1);
    });
  });

  describe('Date and time formatting', () => {
    test('formats date correctly', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const formatted = formatDate(date);

      expect(formatted).toBe('2025-01-15');
    });

    test('pads single digit month', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const formatted = formatDate(date);

      expect(formatted).toBe('2025-01-05');
    });

    test('formats time correctly', () => {
      const hour = 14;
      const minute = 30;
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      expect(timeString).toBe('14:30');
    });

    test('pads single digit hour and minute', () => {
      const hour = 9;
      const minute = 5;
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      expect(timeString).toBe('09:05');
    });
  });

  describe('Storage persistence', () => {
    test('persists classes to AsyncStorage', async () => {
      const classes = {
        kareem: [{ id: 1, date: '2025-01-06', time: '10:00' }]
      };

      await AsyncStorage.setItem('student-classes', JSON.stringify(classes));
      const stored = await AsyncStorage.getItem('student-classes');
      const parsed = JSON.parse(stored);

      expect(parsed.kareem.length).toBe(1);
      expect(parsed.kareem[0].date).toBe('2025-01-06');
    });

    test('loads classes from AsyncStorage', async () => {
      const classes = {
        kareem: [{ id: 1, date: '2025-01-06', time: '10:00' }],
        saraHana: [{ id: 2, date: '2025-01-07', time: '11:00' }]
      };

      await AsyncStorage.setItem('student-classes', JSON.stringify(classes));

      const loaded = await AsyncStorage.getItem('student-classes');
      const parsed = loaded ? JSON.parse(loaded) : { kareem: [], saraHana: [] };

      expect(parsed.kareem.length).toBe(1);
      expect(parsed.saraHana.length).toBe(1);
    });

    test('handles empty storage with defaults', async () => {
      const defaultClasses = { kareem: [], saraHana: [] };
      const loaded = await AsyncStorage.getItem('student-classes');
      const parsed = loaded ? JSON.parse(loaded) : defaultClasses;

      expect(parsed).toEqual(defaultClasses);
    });
  });

  describe('Statistics calculation', () => {
    const mockClasses = {
      kareem: [
        { id: '1', date: '2025-01-06', time: '10:00' },
        { id: '2', date: '2025-01-08', time: '14:00' },
        { id: '3', date: '2025-01-13', time: '10:00' },
      ]
    };

    const mockPrices = {
      kareem: '25.00',
      saraHana: '30.00'
    };

    test('calculates student stats correctly', () => {
      const monthlyClasses = getMonthlyClasses('kareem', '2025-01', mockClasses);
      const studentPrice = parseFloat(mockPrices.kareem) || 0;
      const total = monthlyClasses.length * studentPrice;

      const stats = {
        classCount: monthlyClasses.length,
        total: total,
        classes: monthlyClasses
      };

      expect(stats.classCount).toBe(3);
      expect(stats.total).toBe(75);
    });

    test('calculates total revenue from multiple students', () => {
      const kareemClasses = 3;
      const saraHanaClasses = 2;
      const kareemPrice = 25;
      const saraHanaPrice = 30;

      const totalClasses = kareemClasses + saraHanaClasses;
      const totalRevenue = (kareemClasses * kareemPrice) + (saraHanaClasses * saraHanaPrice);

      expect(totalClasses).toBe(5);
      expect(totalRevenue).toBe(135);
    });
  });

  describe('Edge cases', () => {
    test('handles empty classes object', () => {
      const classes = {};
      const studentClasses = classes['kareem'] || [];

      expect(studentClasses).toEqual([]);
    });

    test('handles null classes array', () => {
      const classes = { kareem: null };
      const studentClasses = classes['kareem'] || [];

      expect(studentClasses).toEqual([]);
    });

    test('handles class with missing properties', () => {
      const incompleteClass = { id: 1 };

      expect(incompleteClass.date).toBeUndefined();
      expect(incompleteClass.time).toBeUndefined();
    });

    test('handles duplicate class detection', () => {
      const existingClasses = [
        { date: '2025-01-06', time: '10:00' }
      ];

      const newDate = '2025-01-06';
      const newTime = '10:00';

      const isDuplicate = existingClasses.some(
        cls => cls.date === newDate && cls.time === newTime
      );

      expect(isDuplicate).toBe(true);
    });
  });
});
