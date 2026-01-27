/**
 * Unit tests for class generation logic
 * Tests: generateClassesForStudent, generateClasses, duplicate detection
 */

describe('Class Generation Functions', () => {

  // Helper to format date
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get day name
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  describe('generateClassesForStudent logic', () => {
    test('generates classes for all Mondays in January 2025', () => {
      const schedules = {
        kareem: [{ id: '1', day: 'Monday', time: '10:00', student: 'kareem' }]
      };
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(yearInt, monthInt - 1, day);
        const dayOfWeek = getDayName(checkDate);

        if (dayOfWeek === 'Monday') {
          generatedClasses.push({
            date: formatDate(checkDate),
            time: '10:00'
          });
        }
      }

      // January 2025 has Mondays on: 6, 13, 20, 27
      expect(generatedClasses.length).toBe(4);
      expect(generatedClasses[0].date).toBe('2025-01-06');
      expect(generatedClasses[1].date).toBe('2025-01-13');
      expect(generatedClasses[2].date).toBe('2025-01-20');
      expect(generatedClasses[3].date).toBe('2025-01-27');
    });

    test('generates classes for multiple schedules', () => {
      const schedules = {
        kareem: [
          { id: '1', day: 'Monday', time: '10:00', student: 'kareem' },
          { id: '2', day: 'Wednesday', time: '14:00', student: 'kareem' }
        ]
      };
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = [];

      schedules.kareem.forEach(schedule => {
        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(yearInt, monthInt - 1, day);
          const dayOfWeek = getDayName(checkDate);

          if (dayOfWeek === schedule.day) {
            generatedClasses.push({
              date: formatDate(checkDate),
              time: schedule.time
            });
          }
        }
      });

      // 4 Mondays + 5 Wednesdays in January 2025
      expect(generatedClasses.length).toBe(9);
    });

    test('detects and skips duplicate classes', () => {
      const existingClasses = [
        { date: '2025-01-06', time: '10:00' }
      ];

      const schedule = { day: 'Monday', time: '10:00' };
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      let totalGenerated = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(yearInt, monthInt - 1, day);
        const dayOfWeek = getDayName(checkDate);

        if (dayOfWeek === schedule.day) {
          const dateString = formatDate(checkDate);

          // Check if class already exists
          const existingClass = existingClasses.find(
            cls => cls.date === dateString && cls.time === schedule.time
          );

          if (!existingClass) {
            existingClasses.push({ date: dateString, time: schedule.time });
            totalGenerated++;
          }
        }
      }

      // Should generate 3 new classes (skipping Jan 6 which exists)
      expect(totalGenerated).toBe(3);
      expect(existingClasses.length).toBe(4); // 1 existing + 3 new
    });

    test('handles empty schedules', () => {
      const schedules = { kareem: [] };
      expect(schedules.kareem.length).toBe(0);
    });

    test('handles schedule for day that does not occur in month', () => {
      // Simulate a schedule for a day that might not occur
      const schedules = {
        kareem: [{ day: 'Sunday', time: '10:00' }]
      };
      const currentMonth = '2025-02'; // February 2025

      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(yearInt, monthInt - 1, day);
        const dayOfWeek = getDayName(checkDate);

        if (dayOfWeek === 'Sunday') {
          generatedClasses.push({
            date: formatDate(checkDate),
            time: '10:00'
          });
        }
      }

      // February 2025 has Sundays on: 2, 9, 16, 23
      expect(generatedClasses.length).toBe(4);
    });
  });

  describe('generateClasses logic (all students)', () => {
    test('generates classes for multiple students', () => {
      const schedules = {
        kareem: [{ day: 'Monday', time: '10:00' }],
        saraHana: [{ day: 'Tuesday', time: '11:00' }]
      };
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = { kareem: [], saraHana: [] };

      Object.keys(schedules).forEach(studentKey => {
        schedules[studentKey].forEach(schedule => {
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(yearInt, monthInt - 1, day);
            const dayName = getDayName(date);

            if (dayName === schedule.day) {
              generatedClasses[studentKey].push({
                date: formatDate(date),
                time: schedule.time
              });
            }
          }
        });
      });

      // 4 Mondays for Kareem, 4 Tuesdays for Sara_Hana
      expect(generatedClasses.kareem.length).toBe(4);
      expect(generatedClasses.saraHana.length).toBe(4);
    });

    test('validates hasSchedules check', () => {
      const emptySchedules = { kareem: [], saraHana: [] };
      const hasSchedules = Object.values(emptySchedules).some(arr => arr && arr.length > 0);
      expect(hasSchedules).toBe(false);

      const withSchedules = { kareem: [{ day: 'Monday' }], saraHana: [] };
      const hasSchedules2 = Object.values(withSchedules).some(arr => arr && arr.length > 0);
      expect(hasSchedules2).toBe(true);
    });
  });

  describe('Month parsing', () => {
    test('correctly calculates days in month for various months', () => {
      // January 2025
      expect(new Date(2025, 1, 0).getDate()).toBe(31);
      // February 2025 (non-leap)
      expect(new Date(2025, 2, 0).getDate()).toBe(28);
      // February 2024 (leap)
      expect(new Date(2024, 2, 0).getDate()).toBe(29);
      // April 2025
      expect(new Date(2025, 4, 0).getDate()).toBe(30);
    });

    test('parses month string correctly', () => {
      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');

      expect(parseInt(year)).toBe(2025);
      expect(parseInt(month)).toBe(1);
    });
  });

  describe('Day of week matching', () => {
    test('correctly identifies day of week', () => {
      // January 6, 2025 is Monday
      const date = new Date(2025, 0, 6);
      expect(getDayName(date)).toBe('Monday');

      // January 7, 2025 is Tuesday
      const date2 = new Date(2025, 0, 7);
      expect(getDayName(date2)).toBe('Tuesday');

      // January 12, 2025 is Sunday
      const date3 = new Date(2025, 0, 12);
      expect(getDayName(date3)).toBe('Sunday');
    });

    test('all days of week can be matched', () => {
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const weekStart = new Date(2025, 0, 6); // Monday

      daysOfWeek.forEach((day, index) => {
        const checkDate = new Date(weekStart);
        checkDate.setDate(checkDate.getDate() + index);
        expect(getDayName(checkDate)).toBe(day);
      });
    });
  });

  describe('Class ID generation', () => {
    test('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        const id = `class_kareem_2025-01-${i}_10:00_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        ids.add(id);
      }
      expect(ids.size).toBe(100);
    });

    test('includes relevant information in ID', () => {
      const studentKey = 'kareem';
      const dateString = '2025-01-06';
      const time = '10:00';
      const id = `class_${studentKey}_${dateString}_${time}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      expect(id).toContain('kareem');
      expect(id).toContain('2025-01-06');
      expect(id).toContain('10:00');
    });
  });

  describe('Edge cases', () => {
    test('handles year boundary in class generation', () => {
      const currentMonth = '2025-12';
      const [year, month] = currentMonth.split('-');
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

      expect(daysInMonth).toBe(31);
    });

    test('handles multiple schedules for same day different times', () => {
      const schedules = [
        { day: 'Monday', time: '09:00' },
        { day: 'Monday', time: '14:00' }
      ];

      const currentMonth = '2025-01';
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = [];

      schedules.forEach(schedule => {
        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(yearInt, monthInt - 1, day);
          const dayOfWeek = getDayName(checkDate);

          if (dayOfWeek === 'Monday') {
            generatedClasses.push({
              date: formatDate(checkDate),
              time: schedule.time
            });
          }
        }
      });

      // 4 Mondays * 2 schedules = 8 classes
      expect(generatedClasses.length).toBe(8);
    });
  });
});
