export default class UserAlreadyVotedError extends Error {
  constructor() {
    super('User has already voted in this poll');
    this.name = 'UserAlreadyVotedError';
  }
}
