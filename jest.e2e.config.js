const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  verbose: true,
  clearMocks: true,

  displayName: 'e2e',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e-spec.ts'],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
    '^domain/(.*)$': '<rootDir>/src/domain/$1',
  }),

  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results', outputName: 'unit.xml' }],
  ],

  collectCoverageFrom: [
    'src/infra/nestjs/controllers/**/*.ts',
    'src/infra/websocket/**/*.ts',
  ],
  coverageDirectory: './coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],

  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: 'es2020',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },

  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

  testTimeout: 60000,
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: false,

  globalSetup: '<rootDir>/tests/e2e/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/e2e/setup/global-teardown.ts',
};
