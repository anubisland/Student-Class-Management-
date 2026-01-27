/**
 * Storage helper functions for Student Class Management App
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  PRICES: 'student-prices',
  CLASSES: 'student-classes',
  SCHEDULES: 'student-schedules'
};

/**
 * Default values for data
 */
export const DEFAULT_VALUES = {
  prices: { kareem: '25.00', saraHana: '30.00' },
  classes: { kareem: [], saraHana: [] },
  schedules: { kareem: [], saraHana: [] }
};

/**
 * Saves data to AsyncStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 * @returns {Promise<boolean>} True if successful
 */
export const saveToDatabase = async (key, data) => {
  try {
    const dataString = JSON.stringify(data);
    await AsyncStorage.setItem(key, dataString);
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

/**
 * Loads data from AsyncStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Loaded data or default value
 */
export const loadFromDatabase = async (key, defaultValue = {}) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Loads all app data
 * @returns {Promise<Object>} Object with prices, classes, and schedules
 */
export const loadAllData = async () => {
  const prices = await loadFromDatabase(STORAGE_KEYS.PRICES, DEFAULT_VALUES.prices);
  const classes = await loadFromDatabase(STORAGE_KEYS.CLASSES, DEFAULT_VALUES.classes);
  const schedules = await loadFromDatabase(STORAGE_KEYS.SCHEDULES, DEFAULT_VALUES.schedules);

  return { prices, classes, schedules };
};

/**
 * Saves prices to storage
 * @param {Object} prices - Prices object
 * @returns {Promise<boolean>} Success status
 */
export const savePrices = async (prices) => {
  return saveToDatabase(STORAGE_KEYS.PRICES, prices);
};

/**
 * Saves classes to storage
 * @param {Object} classes - Classes object
 * @returns {Promise<boolean>} Success status
 */
export const saveClasses = async (classes) => {
  return saveToDatabase(STORAGE_KEYS.CLASSES, classes);
};

/**
 * Saves schedules to storage
 * @param {Object} schedules - Schedules object
 * @returns {Promise<boolean>} Success status
 */
export const saveSchedules = async (schedules) => {
  return saveToDatabase(STORAGE_KEYS.SCHEDULES, schedules);
};

/**
 * Clears all app data
 * @returns {Promise<boolean>} Success status
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PRICES,
      STORAGE_KEYS.CLASSES,
      STORAGE_KEYS.SCHEDULES
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Updates a student's price
 * @param {Object} currentPrices - Current prices object
 * @param {string} student - Student key
 * @param {string} value - New price value
 * @returns {Object} Updated prices object
 */
export const updatePrice = (currentPrices, student, value) => {
  return { ...currentPrices, [student]: value };
};
