import User from '~/domain/entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(): Promise<User[]>;
}
