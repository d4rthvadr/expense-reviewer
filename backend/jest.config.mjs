/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(marked)/)'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
};
