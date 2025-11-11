export default class PollOptionNotFoundError extends Error {
  constructor() {
    super('Poll option not found');
    this.name = 'PollOptionNotFoundError';
  }
}
