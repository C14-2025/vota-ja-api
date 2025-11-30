export default class PollClosedError extends Error {
  constructor() {
    super('This poll is closed');
    this.name = 'PollClosedError';
  }
}
