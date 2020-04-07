module.exports = {
  rootDir: './',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {},
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
  setupFiles: ['<rootDir>/__tests__/setup.ts', 'fake-indexeddb/auto'],
  testRegex: '.*test\\.tsx?$',
  testPathIgnorePatterns: ['node_modules'],
};
