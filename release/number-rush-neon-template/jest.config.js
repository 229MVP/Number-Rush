/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/test/**',
    '!src/**/*.d.ts',
    '!src/dev/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/design_reference/',
    '/ui/',
    '/autoload/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/design_reference/',
    '<rootDir>/ui/',
    '<rootDir>/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/react-native-skia|native-base|react-native-svg|lucide-react-native)',
  ],
};
