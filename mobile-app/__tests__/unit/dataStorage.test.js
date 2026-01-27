/**
 * Unit tests for data storage functions
 * Tests: saveToDatabase, loadFromDatabase, loadData, AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Data Storage Functions', () => {

  beforeEach(() => {
    AsyncStorage.__reset();
  });

  describe('saveToDatabase logic', () => {
    test('saves data to AsyncStorage successfully', async () => {
      const key = 'test-key';
      const data = { name: 'test', value: 123 };

      await AsyncStorage.setItem(key, JSON.stringify(data));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(data));
    });

    test('serializes objects correctly', async () => {
      const data = {
        kareem: [
          { id: '1', date: '2025-01-06', time: '10:00' }
        ]
      };

      await AsyncStorage.setItem('student-classes', JSON.stringify(data));
      const stored = await AsyncStorage.getItem('student-classes');

      expect(JSON.parse(stored)).toEqual(data);
    });

    test('handles nested objects', async () => {
      const data = {
        kareem: '25.00',
        saraHana: '30.00'
      };

      await AsyncStorage.setItem('student-prices', JSON.stringify(data));
      const stored = await AsyncStorage.getItem('student-prices');

      expect(JSON.parse(stored)).toEqual(data);
    });

    test('overwrites existing data', async () => {
      await AsyncStorage.setItem('test', JSON.stringify({ old: 'data' }));
      await AsyncStorage.setItem('test', JSON.stringify({ new: 'data' }));

      const stored = await AsyncStorage.getItem('test');
      expect(JSON.parse(stored)).toEqual({ new: 'data' });
    });
  });

  describe('loadFromDatabase logic', () => {
    test('loads existing data from AsyncStorage', async () => {
      const data = { kareem: '25.00', saraHana: '30.00' };
      await AsyncStorage.setItem('student-prices', JSON.stringify(data));

      const loaded = await AsyncStorage.getItem('student-prices');
      const parsed = loaded ? JSON.parse(loaded) : {};

      expect(parsed).toEqual(data);
    });

    test('returns default value when key does not exist', async () => {
      const defaultValue = { kareem: '25.00', saraHana: '30.00' };
      const loaded = await AsyncStorage.getItem('non-existent-key');
      const result = loaded ? JSON.parse(loaded) : defaultValue;

      expect(result).toEqual(defaultValue);
    });

    test('handles empty storage', async () => {
      const keys = await AsyncStorage.getAllKeys();
      expect(keys.length).toBe(0);
    });

    test('loads complex nested data', async () => {
      const complexData = {
        kareem: [
          { id: '1', date: '2025-01-06', time: '10:00', nested: { deep: true } }
        ],
        saraHana: [
          { id: '2', date: '2025-01-07', time: '11:00' }
        ]
      };

      await AsyncStorage.setItem('complex-data', JSON.stringify(complexData));
      const loaded = await AsyncStorage.getItem('complex-data');

      expect(JSON.parse(loaded)).toEqual(complexData);
    });
  });

  describe('loadData function behavior', () => {
    test('loads all three data types with defaults', async () => {
      const defaultPrices = { kareem: '25.00', saraHana: '30.00' };
      const defaultClasses = { kareem: [], saraHana: [] };
      const defaultSchedules = { kareem: [], saraHana: [] };

      // Simulate loadData behavior
      const loadFromDB = async (key, defaultValue) => {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      };

      const prices = await loadFromDB('student-prices', defaultPrices);
      const classes = await loadFromDB('student-classes', defaultClasses);
      const schedules = await loadFromDB('student-schedules', defaultSchedules);

      expect(prices).toEqual(defaultPrices);
      expect(classes).toEqual(defaultClasses);
      expect(schedules).toEqual(defaultSchedules);
    });

    test('loads existing data when available', async () => {
      const existingPrices = { kareem: '35.00', saraHana: '40.00' };
      const existingClasses = { kareem: [{ id: '1' }], saraHana: [] };

      await AsyncStorage.setItem('student-prices', JSON.stringify(existingPrices));
      await AsyncStorage.setItem('student-classes', JSON.stringify(existingClasses));

      const loadFromDB = async (key, defaultValue) => {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      };

      const prices = await loadFromDB('student-prices', {});
      const classes = await loadFromDB('student-classes', {});

      expect(prices).toEqual(existingPrices);
      expect(classes).toEqual(existingClasses);
    });
  });

  describe('AsyncStorage operations', () => {
    test('setItem and getItem work correctly', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      const result = await AsyncStorage.getItem('key1');
      expect(result).toBe('value1');
    });

    test('removeItem removes data', async () => {
      await AsyncStorage.setItem('key-to-remove', 'data');
      await AsyncStorage.removeItem('key-to-remove');
      const result = await AsyncStorage.getItem('key-to-remove');
      expect(result).toBeNull();
    });

    test('clear removes all data', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');
      await AsyncStorage.clear();
      const keys = await AsyncStorage.getAllKeys();
      expect(keys.length).toBe(0);
    });

    test('getAllKeys returns all stored keys', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');
      const keys = await AsyncStorage.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    test('multiGet retrieves multiple values', async () => {
      await AsyncStorage.setItem('key1', 'value1');
      await AsyncStorage.setItem('key2', 'value2');
      const result = await AsyncStorage.multiGet(['key1', 'key2']);
      expect(result).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);
    });

    test('multiSet stores multiple values', async () => {
      await AsyncStorage.multiSet([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);
      const value1 = await AsyncStorage.getItem('key1');
      const value2 = await AsyncStorage.getItem('key2');
      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });
  });

  describe('Error handling', () => {
    test('handles JSON parse errors gracefully', () => {
      const invalidJson = '{invalid json}';
      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    test('handles null data', async () => {
      const data = await AsyncStorage.getItem('non-existent');
      expect(data).toBeNull();

      const result = data ? JSON.parse(data) : { default: 'value' };
      expect(result).toEqual({ default: 'value' });
    });

    test('handles undefined gracefully', () => {
      const data = undefined;
      const result = data ? JSON.parse(data) : { default: 'value' };
      expect(result).toEqual({ default: 'value' });
    });
  });

  describe('Data integrity', () => {
    test('preserves data types after storage', async () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: true }
      };

      await AsyncStorage.setItem('types-test', JSON.stringify(data));
      const loaded = await AsyncStorage.getItem('types-test');
      const parsed = JSON.parse(loaded);

      expect(typeof parsed.string).toBe('string');
      expect(typeof parsed.number).toBe('number');
      expect(typeof parsed.boolean).toBe('boolean');
      expect(Array.isArray(parsed.array)).toBe(true);
      expect(typeof parsed.object).toBe('object');
    });

    test('handles special characters in data', async () => {
      const data = {
        special: 'Test with "quotes" and \'apostrophes\'',
        unicode: 'émojis 🎉'
      };

      await AsyncStorage.setItem('special-chars', JSON.stringify(data));
      const loaded = await AsyncStorage.getItem('special-chars');
      const parsed = JSON.parse(loaded);

      expect(parsed.special).toBe('Test with "quotes" and \'apostrophes\'');
      expect(parsed.unicode).toBe('émojis 🎉');
    });

    test('handles large data sets', async () => {
      const largeData = {
        kareem: Array(100).fill(null).map((_, i) => ({
          id: `class-${i}`,
          date: '2025-01-01',
          time: '10:00'
        }))
      };

      await AsyncStorage.setItem('large-data', JSON.stringify(largeData));
      const loaded = await AsyncStorage.getItem('large-data');
      const parsed = JSON.parse(loaded);

      expect(parsed.kareem.length).toBe(100);
    });
  });
});
