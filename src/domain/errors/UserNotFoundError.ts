export default class UserNotFoundError extends Error {
  constructor(userId?: string) {
    super(userId ? `User with ID ${userId} not found` : 'User not found');
    this.name = 'UserNotFoundError';
  }
}
