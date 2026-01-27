/**
 * Unit tests for storageHelpers utility module
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  DEFAULT_VALUES,
  saveToDatabase,
  loadFromDatabase,
  loadAllData,
  savePrices,
  saveClasses,
  saveSchedules,
  clearAllData,
  updatePrice
} from '../../utils/storageHelpers';

describe('storageHelpers', () => {
  beforeEach(() => {
    AsyncStorage.__reset();
    jest.clearAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    test('has correct key values', () => {
      expect(STORAGE_KEYS.PRICES).toBe('student-prices');
      expect(STORAGE_KEYS.CLASSES).toBe('student-classes');
      expect(STORAGE_KEYS.SCHEDULES).toBe('student-schedules');
    });
  });

  describe('DEFAULT_VALUES', () => {
    test('has default prices', () => {
      expect(DEFAULT_VALUES.prices).toEqual({
        kareem: '25.00',
        saraHana: '30.00'
      });
    });

    test('has empty default classes', () => {
      expect(DEFAULT_VALUES.classes).toEqual({
        kareem: [],
        saraHana: []
      });
    });

    test('has empty default schedules', () => {
      expect(DEFAULT_VALUES.schedules).toEqual({
        kareem: [],
        saraHana: []
      });
    });
  });

  describe('saveToDatabase', () => {
    test('saves data successfully', async () => {
      const data = { test: 'value' };
      const result = await saveToDatabase('test-key', data);
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(data));
    });

    test('returns false on error', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Save failed'));
      const result = await saveToDatabase('test-key', { test: 'value' });
      expect(result).toBe(false);
    });

    test('saves complex objects', async () => {
      const data = {
        prices: { kareem: '25.00' },
        classes: [{ id: 1, date: '2025-01-06' }]
      };
      const result = await saveToDatabase('complex-key', data);
      expect(result).toBe(true);
    });
  });

  describe('loadFromDatabase', () => {
    test('loads existing data', async () => {
      const data = { test: 'value' };
      await AsyncStorage.setItem('test-key', JSON.stringify(data));
      const result = await loadFromDatabase('test-key');
      expect(result).toEqual(data);
    });

    test('returns default value when key not found', async () => {
      const defaultValue = { default: 'value' };
      const result = await loadFromDatabase('missing-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('returns empty object by default', async () => {
      const result = await loadFromDatabase('missing-key');
      expect(result).toEqual({});
    });

    test('returns default on parse error', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('invalid json');
      const defaultValue = { default: 'value' };
      const result = await loadFromDatabase('bad-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('loadAllData', () => {
    test('loads all data with defaults', async () => {
      const result = await loadAllData();
      expect(result).toHaveProperty('prices');
      expect(result).toHaveProperty('classes');
      expect(result).toHaveProperty('schedules');
    });

    test('loads stored data', async () => {
      const prices = { kareem: '30.00', saraHana: '35.00' };
      const classes = { kareem: [{ id: 1 }], saraHana: [] };
      const schedules = { kareem: [{ id: 1, day: 'Monday' }], saraHana: [] };

      await AsyncStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
      await AsyncStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));

      const result = await loadAllData();
      expect(result.prices).toEqual(prices);
      expect(result.classes).toEqual(classes);
      expect(result.schedules).toEqual(schedules);
    });
  });

  describe('savePrices', () => {
    test('saves prices to correct key', async () => {
      const prices = { kareem: '30.00', saraHana: '35.00' };
      await savePrices(prices);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PRICES,
        JSON.stringify(prices)
      );
    });
  });

  describe('saveClasses', () => {
    test('saves classes to correct key', async () => {
      const classes = { kareem: [{ id: 1 }], saraHana: [] };
      await saveClasses(classes);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CLASSES,
        JSON.stringify(classes)
      );
    });
  });

  describe('saveSchedules', () => {
    test('saves schedules to correct key', async () => {
      const schedules = { kareem: [{ id: 1 }], saraHana: [] };
      await saveSchedules(schedules);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SCHEDULES,
        JSON.stringify(schedules)
      );
    });
  });

  describe('clearAllData', () => {
    test('clears all storage keys', async () => {
      await clearAllData();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.PRICES,
        STORAGE_KEYS.CLASSES,
        STORAGE_KEYS.SCHEDULES
      ]);
    });

    test('returns true on success', async () => {
      const result = await clearAllData();
      expect(result).toBe(true);
    });

    test('returns false on error', async () => {
      AsyncStorage.multiRemove.mockRejectedValueOnce(new Error('Clear failed'));
      const result = await clearAllData();
      expect(result).toBe(false);
    });
  });

  describe('updatePrice', () => {
    test('updates price for student', () => {
      const currentPrices = { kareem: '25.00', saraHana: '30.00' };
      const result = updatePrice(currentPrices, 'kareem', '35.00');
      expect(result.kareem).toBe('35.00');
      expect(result.saraHana).toBe('30.00');
    });

    test('preserves other prices', () => {
      const currentPrices = { kareem: '25.00', saraHana: '30.00' };
      const result = updatePrice(currentPrices, 'saraHana', '40.00');
      expect(result.kareem).toBe('25.00');
      expect(result.saraHana).toBe('40.00');
    });

    test('adds price for new student', () => {
      const currentPrices = { kareem: '25.00' };
      const result = updatePrice(currentPrices, 'saraHana', '30.00');
      expect(result.saraHana).toBe('30.00');
    });
  });
});
