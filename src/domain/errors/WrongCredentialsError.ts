export default class WrongCredentialsError extends Error {
  constructor() {
    super('Credentials are not valid.');
    this.name = 'WrongCredentialsError';
  }
}
