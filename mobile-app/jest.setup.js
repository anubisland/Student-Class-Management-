// Jest setup file for React Native testing

// Mock Alert
global.Alert = {
  alert: jest.fn((title, message, buttons) => {
    if (buttons && buttons.length > 0) {
      global.lastAlertButtons = buttons;
    }
  }),
};

// Mock Share
global.Share = {
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
};

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = {
    Alert: global.Alert,
    Share: global.Share,
    Platform: {
      OS: 'android',
      select: jest.fn((obj) => obj.android || obj.default),
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    StatusBar: 'StatusBar',
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
    },
  };
  return RN;
});

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  return {
    Provider: ({ children }) => children,
    DefaultTheme: { colors: {} },
    Surface: 'Surface',
    Card: Object.assign('Card', { Content: 'Card.Content' }),
    Text: 'Text',
    Button: 'Button',
    TextInput: 'TextInput',
    Chip: 'Chip',
    Modal: 'Modal',
    Portal: ({ children }) => children,
    ActivityIndicator: 'ActivityIndicator',
    Appbar: {
      Header: 'Appbar.Header',
      Content: 'Appbar.Content',
    },
    IconButton: 'IconButton',
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: 'SafeAreaView',
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Note: AsyncStorage mock is handled via moduleNameMapper in jest.config.js

// Global test utilities
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
