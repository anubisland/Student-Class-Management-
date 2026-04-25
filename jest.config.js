module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/mobile-app/', '/react-native-app/'],
  collectCoverageFrom: ['script.js'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  verbose: true,
};
