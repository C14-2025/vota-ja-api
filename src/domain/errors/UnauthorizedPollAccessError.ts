export default class UnauthorizedPollAccessError extends Error {
  constructor() {
    super('Unauthorized to access this private poll');
    this.name = 'UnauthorizedPollAccessError';
  }
}
