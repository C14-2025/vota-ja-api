import 'reflect-metadata';

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

process.env.NODE_ENV = 'test';

jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});
