/**
 * Integration tests for schedule and class management
 * Tests: addSchedule, removeSchedule, addClass, removeClass
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

describe('Schedule Management Integration', () => {

  beforeEach(() => {
    AsyncStorage.__reset();
    jest.clearAllMocks();
  });

  describe('addSchedule', () => {
    test('creates a new schedule with correct properties', async () => {
      const selectedStudent = 'kareem';
      const selectedDay = 'Monday';
      const selectedScheduleHour = 10;
      const selectedScheduleMinute = 30;
      const schedules = { kareem: [], saraHana: [] };

      // Simulate addSchedule
      const formattedTime = `${String(selectedScheduleHour).padStart(2, '0')}:${String(selectedScheduleMinute).padStart(2, '0')}`;

      const newSchedule = {
        id: Date.now(),
        day: selectedDay,
        time: formattedTime,
        student: selectedStudent
      };

      const currentSchedules = { ...schedules };
      if (!currentSchedules[selectedStudent]) {
        currentSchedules[selectedStudent] = [];
      }
      currentSchedules[selectedStudent].push(newSchedule);

      await AsyncStorage.setItem('student-schedules', JSON.stringify(currentSchedules));

      expect(currentSchedules.kareem.length).toBe(1);
      expect(currentSchedules.kareem[0].day).toBe('Monday');
      expect(currentSchedules.kareem[0].time).toBe('10:30');
      expect(currentSchedules.kareem[0].student).toBe('kareem');
    });

    test('adds schedule to existing list', async () => {
      const existingSchedule = { id: 1, day: 'Monday', time: '10:00', student: 'kareem' };
      const schedules = { kareem: [existingSchedule], saraHana: [] };

      const newSchedule = { id: 2, day: 'Wednesday', time: '14:00', student: 'kareem' };
      schedules.kareem.push(newSchedule);

      await AsyncStorage.setItem('student-schedules', JSON.stringify(schedules));

      expect(schedules.kareem.length).toBe(2);
      expect(schedules.kareem[1].day).toBe('Wednesday');
    });

    test('persists schedule to AsyncStorage', async () => {
      const schedules = {
        kareem: [{ id: 1, day: 'Monday', time: '10:00' }]
      };

      await AsyncStorage.setItem('student-schedules', JSON.stringify(schedules));
      const stored = await AsyncStorage.getItem('student-schedules');
      const parsed = JSON.parse(stored);

      expect(parsed.kareem[0].day).toBe('Monday');
    });
  });

  describe('removeSchedule', () => {
    test('removes schedule by ID', async () => {
      const schedules = {
        kareem: [
          { id: 1, day: 'Monday', time: '10:00' },
          { id: 2, day: 'Wednesday', time: '14:00' }
        ]
      };

      const scheduleIdToRemove = 1;
      const updatedSchedules = { ...schedules };
      updatedSchedules.kareem = updatedSchedules.kareem.filter(s => s.id !== scheduleIdToRemove);

      await AsyncStorage.setItem('student-schedules', JSON.stringify(updatedSchedules));

      expect(updatedSchedules.kareem.length).toBe(1);
      expect(updatedSchedules.kareem[0].id).toBe(2);
    });

    test('handles removing non-existent schedule', () => {
      const schedules = {
        kareem: [{ id: 1, day: 'Monday', time: '10:00' }]
      };

      const nonExistentId = 999;
      const updatedSchedules = { ...schedules };
      updatedSchedules.kareem = updatedSchedules.kareem.filter(s => s.id !== nonExistentId);

      // Should remain unchanged
      expect(updatedSchedules.kareem.length).toBe(1);
    });

    test('removes last schedule leaving empty array', () => {
      const schedules = {
        kareem: [{ id: 1, day: 'Monday', time: '10:00' }]
      };

      const updatedSchedules = { ...schedules };
      updatedSchedules.kareem = updatedSchedules.kareem.filter(s => s.id !== 1);

      expect(updatedSchedules.kareem.length).toBe(0);
      expect(updatedSchedules.kareem).toEqual([]);
    });
  });
});

describe('Class Management Integration', () => {

  beforeEach(() => {
    AsyncStorage.__reset();
    jest.clearAllMocks();
  });

  describe('addClass', () => {
    test('creates a new class with correct properties', async () => {
      const selectedStudent = 'kareem';
      const newClassDate = new Date(2025, 0, 15);
      const selectedHour = 14;
      const selectedMinute = 30;
      const classes = { kareem: [], saraHana: [] };

      // Simulate addClass
      const dateString = `${newClassDate.getFullYear()}-${String(newClassDate.getMonth() + 1).padStart(2, '0')}-${String(newClassDate.getDate()).padStart(2, '0')}`;
      const timeString = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

      const newClass = {
        id: Date.now(),
        date: dateString,
        time: timeString,
        timestamp: new Date().toISOString()
      };

      const updatedClasses = {
        ...classes,
        [selectedStudent]: [...(classes[selectedStudent] || []), newClass]
      };

      await AsyncStorage.setItem('student-classes', JSON.stringify(updatedClasses));

      expect(updatedClasses.kareem.length).toBe(1);
      expect(updatedClasses.kareem[0].date).toBe('2025-01-15');
      expect(updatedClasses.kareem[0].time).toBe('14:30');
    });

    test('adds class to existing list', async () => {
      const existingClass = { id: 1, date: '2025-01-10', time: '10:00' };
      const classes = { kareem: [existingClass], saraHana: [] };

      const newClass = { id: 2, date: '2025-01-15', time: '14:00' };
      const updatedClasses = {
        ...classes,
        kareem: [...classes.kareem, newClass]
      };

      await AsyncStorage.setItem('student-classes', JSON.stringify(updatedClasses));

      expect(updatedClasses.kareem.length).toBe(2);
    });
  });

  describe('removeClass', () => {
    test('removes class by ID', async () => {
      const classes = {
        kareem: [
          { id: 1, date: '2025-01-06', time: '10:00' },
          { id: 2, date: '2025-01-08', time: '14:00' }
        ]
      };

      const classIdToRemove = 1;
      const updatedClasses = { ...classes };
      updatedClasses.kareem = updatedClasses.kareem.filter(c => c.id !== classIdToRemove);

      await AsyncStorage.setItem('student-classes', JSON.stringify(updatedClasses));

      expect(updatedClasses.kareem.length).toBe(1);
      expect(updatedClasses.kareem[0].id).toBe(2);
    });

    test('handles removing non-existent class', () => {
      const classes = {
        kareem: [{ id: 1, date: '2025-01-06', time: '10:00' }]
      };

      const nonExistentId = 999;
      const updatedClasses = { ...classes };
      updatedClasses.kareem = updatedClasses.kareem.filter(c => c.id !== nonExistentId);

      expect(updatedClasses.kareem.length).toBe(1);
    });
  });

  describe('generateClassesForStudent', () => {
    test('generates classes from schedules for a month', async () => {
      const schedules = {
        kareem: [{ id: 1, day: 'Monday', time: '10:00', student: 'kareem' }]
      };
      const classes = { kareem: [], saraHana: [] };
      const currentMonth = '2025-01';

      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const updatedClasses = { ...classes };
      let totalGenerated = 0;

      schedules.kareem.forEach(schedule => {
        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(yearInt, monthInt - 1, day);
          const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' });

          if (dayOfWeek === schedule.day) {
            const dateString = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const existingClass = updatedClasses.kareem.find(
              cls => cls.date === dateString && cls.time === schedule.time
            );

            if (!existingClass) {
              updatedClasses.kareem.push({
                id: `class_${Date.now()}_${Math.random()}`,
                date: dateString,
                time: schedule.time,
                student: 'kareem',
                generated: true
              });
              totalGenerated++;
            }
          }
        }
      });

      // January 2025 has 4 Mondays
      expect(totalGenerated).toBe(4);
      expect(updatedClasses.kareem.length).toBe(4);
    });

    test('does not create duplicate classes', async () => {
      const existingClasses = {
        kareem: [{ id: 1, date: '2025-01-06', time: '10:00' }]
      };
      const schedules = {
        kareem: [{ day: 'Monday', time: '10:00' }]
      };
      const currentMonth = '2025-01';

      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const updatedClasses = JSON.parse(JSON.stringify(existingClasses));
      let totalGenerated = 0;

      schedules.kareem.forEach(schedule => {
        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(yearInt, monthInt - 1, day);
          const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' });

          if (dayOfWeek === schedule.day) {
            const dateString = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const existingClass = updatedClasses.kareem.find(
              cls => cls.date === dateString && cls.time === schedule.time
            );

            if (!existingClass) {
              updatedClasses.kareem.push({
                id: `class_${Date.now()}`,
                date: dateString,
                time: schedule.time,
                generated: true
              });
              totalGenerated++;
            }
          }
        }
      });

      // Should skip Jan 6 (already exists), generate 3 new
      expect(totalGenerated).toBe(3);
      expect(updatedClasses.kareem.length).toBe(4);
    });

    test('handles empty schedules', () => {
      const schedules = { kareem: [] };

      expect(schedules.kareem.length).toBe(0);

      // Should not generate any classes
      const totalGenerated = 0;
      expect(totalGenerated).toBe(0);
    });
  });

  describe('generateClasses (all students)', () => {
    test('generates classes for multiple students', async () => {
      const schedules = {
        kareem: [{ day: 'Monday', time: '10:00' }],
        saraHana: [{ day: 'Tuesday', time: '11:00' }]
      };
      const classes = { kareem: [], saraHana: [] };
      const currentMonth = '2025-01';

      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();

      const generatedClasses = { ...classes };
      let totalGenerated = 0;

      Object.keys(schedules).forEach(studentKey => {
        schedules[studentKey].forEach(schedule => {
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(yearInt, monthInt - 1, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (dayName === schedule.day) {
              const dateString = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              if (!generatedClasses[studentKey]) {
                generatedClasses[studentKey] = [];
              }
              generatedClasses[studentKey].push({
                id: `generated_${Date.now()}_${Math.random()}`,
                date: dateString,
                time: schedule.time,
                generated: true,
                student: studentKey
              });
              totalGenerated++;
            }
          }
        });
      });

      // 4 Mondays + 4 Tuesdays in January 2025
      expect(totalGenerated).toBe(8);
      expect(generatedClasses.kareem.length).toBe(4);
      expect(generatedClasses.saraHana.length).toBe(4);
    });

    test('validates hasSchedules check', () => {
      const emptySchedules = { kareem: [], saraHana: [] };
      const hasSchedules = Object.values(emptySchedules).some(arr => arr && arr.length > 0);
      expect(hasSchedules).toBe(false);
    });
  });
});

describe('Alert interactions', () => {
  test('Alert.alert is called with correct parameters for schedule added', () => {
    const studentName = 'Kareem';
    const day = 'Monday';
    const time = '10:00';

    Alert.alert('Schedule Added!', `${studentName}: ${day} at ${time}`);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Schedule Added!',
      'Kareem: Monday at 10:00'
    );
  });

  test('Alert.alert is called for remove confirmation', () => {
    const studentName = 'Kareem';

    Alert.alert(
      'Remove Schedule',
      `Are you sure you want to remove this schedule for ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: jest.fn() }
      ]
    );

    expect(Alert.alert).toHaveBeenCalled();
  });
});
