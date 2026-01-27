// AsyncStorage mock for Jest testing
let storage = {};

const AsyncStorage = {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve, reject) => {
      try {
        storage[key] = value;
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }),

  getItem: jest.fn((key) => {
    return new Promise((resolve, reject) => {
      try {
        const value = storage[key] || null;
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  }),

  removeItem: jest.fn((key) => {
    return new Promise((resolve, reject) => {
      try {
        delete storage[key];
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }),

  clear: jest.fn(() => {
    return new Promise((resolve, reject) => {
      try {
        storage = {};
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }),

  getAllKeys: jest.fn(() => {
    return new Promise((resolve, reject) => {
      try {
        resolve(Object.keys(storage));
      } catch (error) {
        reject(error);
      }
    });
  }),

  multiGet: jest.fn((keys) => {
    return new Promise((resolve, reject) => {
      try {
        const result = keys.map(key => [key, storage[key] || null]);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }),

  multiSet: jest.fn((keyValuePairs) => {
    return new Promise((resolve, reject) => {
      try {
        keyValuePairs.forEach(([key, value]) => {
          storage[key] = value;
        });
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }),

  multiRemove: jest.fn((keys) => {
    return new Promise((resolve, reject) => {
      try {
        keys.forEach(key => {
          delete storage[key];
        });
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }),

  // Test helper methods
  __getStorage: () => storage,
  __setStorage: (newStorage) => { storage = newStorage; },
  __reset: () => {
    storage = {};
    AsyncStorage.setItem.mockClear();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    AsyncStorage.clear.mockClear();
    AsyncStorage.getAllKeys.mockClear();
    AsyncStorage.multiGet.mockClear();
    AsyncStorage.multiSet.mockClear();
    AsyncStorage.multiRemove.mockClear();
  },
};

module.exports = AsyncStorage;
