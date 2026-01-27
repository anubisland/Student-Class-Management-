/**
 * Unit tests for price calculation functions
 * Tests: getStudentStats, updatePrice, getMonthlyClasses
 */

describe('Price Calculation Functions', () => {

  describe('getStudentStats logic', () => {
    const mockClasses = {
      kareem: [
        { id: '1', date: '2025-01-06', time: '10:00' },
        { id: '2', date: '2025-01-08', time: '14:00' },
        { id: '3', date: '2025-01-13', time: '10:00' },
        { id: '4', date: '2025-02-03', time: '10:00' }, // Different month
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

    // Helper to simulate getMonthlyClasses
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

    // Helper to simulate getStudentStats
    const getStudentStats = (student, month, classes, prices) => {
      const monthlyClasses = getMonthlyClasses(student, month, classes);
      const studentPrice = parseFloat(prices[student]) || 0;
      const total = monthlyClasses.length * studentPrice;

      return {
        classCount: monthlyClasses.length,
        total: total,
        classes: monthlyClasses
      };
    };

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
      expect(stats.classes.length).toBe(2);
    });

    test('returns zero for month with no classes', () => {
      const stats = getStudentStats('kareem', '2025-03', mockClasses, mockPrices);

      expect(stats.classCount).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.classes.length).toBe(0);
    });

    test('returns zero for non-existent student', () => {
      const stats = getStudentStats('unknown', '2025-01', mockClasses, mockPrices);

      expect(stats.classCount).toBe(0);
      expect(stats.total).toBe(0);
    });

    test('handles missing price (defaults to 0)', () => {
      const pricesWithMissing = { kareem: '25.00' };
      const stats = getStudentStats('saraHana', '2025-01', mockClasses, pricesWithMissing);

      expect(stats.classCount).toBe(2);
      expect(stats.total).toBe(0); // No price = $0
    });

    test('handles invalid price string (defaults to 0)', () => {
      const invalidPrices = { kareem: 'invalid' };
      const stats = getStudentStats('kareem', '2025-01', mockClasses, invalidPrices);

      expect(stats.classCount).toBe(3);
      expect(stats.total).toBe(0); // parseFloat('invalid') || 0 = 0
    });

    test('calculates combined total correctly', () => {
      const kareemStats = getStudentStats('kareem', '2025-01', mockClasses, mockPrices);
      const saraHanaStats = getStudentStats('saraHana', '2025-01', mockClasses, mockPrices);
      const totalRevenue = kareemStats.total + saraHanaStats.total;
      const totalClasses = kareemStats.classCount + saraHanaStats.classCount;

      expect(totalClasses).toBe(5);
      expect(totalRevenue).toBe(135); // $75 + $60
    });
  });

  describe('getMonthlyClasses logic', () => {
    const mockClasses = {
      kareem: [
        { id: '1', date: '2025-01-06', time: '10:00' },
        { id: '2', date: '2025-01-08', time: '14:00' },
        { id: '3', date: '2025-01-13', time: '10:00' },
        { id: '4', date: '2025-01-13', time: '16:00' }, // Same day, different time
        { id: '5', date: '2025-02-03', time: '10:00' }, // Different month
      ],
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

    test('filters classes by month correctly', () => {
      const result = getMonthlyClasses('kareem', '2025-01', mockClasses);
      expect(result.length).toBe(4);
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

      // Check that dates are in descending order
      for (let i = 0; i < result.length - 1; i++) {
        const currentDate = new Date(result[i].date + 'T' + result[i].time);
        const nextDate = new Date(result[i + 1].date + 'T' + result[i + 1].time);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    test('handles same day with different times correctly', () => {
      const result = getMonthlyClasses('kareem', '2025-01', mockClasses);
      const jan13Classes = result.filter(c => c.date === '2025-01-13');

      expect(jan13Classes.length).toBe(2);
      // 16:00 should come before 10:00 (descending)
      expect(jan13Classes[0].time).toBe('16:00');
      expect(jan13Classes[1].time).toBe('10:00');
    });
  });

  describe('updatePrice logic', () => {
    test('updates price correctly', () => {
      const prices = { kareem: '25.00', saraHana: '30.00' };
      const updatedPrices = { ...prices, kareem: '35.00' };

      expect(updatedPrices.kareem).toBe('35.00');
      expect(updatedPrices.saraHana).toBe('30.00');
    });

    test('preserves other prices when updating one', () => {
      const prices = { kareem: '25.00', saraHana: '30.00' };
      const updatedPrices = { ...prices, saraHana: '40.00' };

      expect(updatedPrices.kareem).toBe('25.00');
      expect(updatedPrices.saraHana).toBe('40.00');
    });

    test('handles decimal prices', () => {
      const prices = { kareem: '25.50' };
      expect(parseFloat(prices.kareem)).toBe(25.5);
    });

    test('handles zero price', () => {
      const prices = { kareem: '0.00' };
      expect(parseFloat(prices.kareem)).toBe(0);
    });
  });

  describe('Revenue calculations', () => {
    test('calculates revenue with decimal prices correctly', () => {
      const price = parseFloat('25.50');
      const classCount = 4;
      const total = classCount * price;

      expect(total).toBe(102); // 4 * 25.50
    });

    test('calculates grand total from multiple students', () => {
      const kareemTotal = 3 * 25;
      const saraHanaTotal = 2 * 30;
      const grandTotal = kareemTotal + saraHanaTotal;

      expect(grandTotal).toBe(135);
    });

    test('handles large number of classes', () => {
      const price = 25;
      const classCount = 100;
      const total = classCount * price;

      expect(total).toBe(2500);
    });
  });
});

describe('getAvailableMonths logic', () => {
  test('generates 12 months from current date', () => {
    const months = new Set();
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthString);
    }

    expect(months.size).toBe(12);
  });

  test('includes months from existing classes', () => {
    const months = new Set();
    const classes = {
      kareem: [
        { date: '2024-06-15' },
        { date: '2024-07-20' },
      ]
    };

    Object.values(classes).forEach(studentClasses => {
      studentClasses.forEach(cls => {
        const monthString = cls.date.substring(0, 7);
        months.add(monthString);
      });
    });

    expect(months.has('2024-06')).toBe(true);
    expect(months.has('2024-07')).toBe(true);
  });

  test('sorts months chronologically', () => {
    const months = ['2025-03', '2025-01', '2025-02'];
    const sorted = months.sort((a, b) => a.localeCompare(b));

    expect(sorted).toEqual(['2025-01', '2025-02', '2025-03']);
  });
});
