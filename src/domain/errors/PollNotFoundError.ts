export default class PollNotFoundError extends Error {
  constructor() {
    super('Poll not found');
    this.name = 'PollNotFoundError';
  }
}
