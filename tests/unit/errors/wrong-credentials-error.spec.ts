import WrongCredentialsError from '../../../src/domain/errors/WrongCredentialsError';

describe('WrongCredentialsError', () => {
  it('should extend Error with correct name and message', () => {
    const err = new WrongCredentialsError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('WrongCredentialsError');
    expect(err.message).toBe('Credentials are not valid.');
  });

  it('should have a proper stack trace', () => {
    const err = new WrongCredentialsError();
    expect(err.stack).toEqual(expect.any(String));
    expect(err.stack).toContain('WrongCredentialsError');
  });
});
