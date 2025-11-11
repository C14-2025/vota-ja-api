import GetUserByIdUseCase from '../../../../src/domain/use-cases/user/get-user-by-id';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import UserNotFoundError from '../../../../src/domain/errors/UserNotFoundError';
import User from '../../../../src/domain/entities/User';

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    const mockUser: User = {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      lastLogin: new Date('2023-10-15T14:30:00.000Z'),
    };

    it('should get user by id successfully', async () => {
      userRepository.getById.mockResolvedValue(mockUser);

      const result = await getUserByIdUseCase.execute(userId);

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        lastLogin: mockUser.lastLogin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      userRepository.getById.mockResolvedValue(null);

      await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(userId);
    });

    it('should throw UserNotFoundError with correct message', async () => {
      userRepository.getById.mockResolvedValue(null);

      try {
        await getUserByIdUseCase.execute(userId);
        fail('Should have thrown UserNotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundError);
        expect(error.message).toBe(`User with ID ${userId} not found`);
      }
    });

    it('should get user without lastLogin', async () => {
      const userWithoutLastLogin = {
        ...mockUser,
        lastLogin: undefined,
      };

      userRepository.getById.mockResolvedValue(userWithoutLastLogin);

      const result = await getUserByIdUseCase.execute(userId);

      expect(result.lastLogin).toBeUndefined();
      expect(result.id).toBe(userId);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection error');
      userRepository.getById.mockRejectedValue(error);

      await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
        'Database connection error',
      );

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
    });

    it('should not include password in the response', async () => {
      userRepository.getById.mockResolvedValue(mockUser);

      const result = await getUserByIdUseCase.execute(userId);

      expect(result).not.toHaveProperty('password');
      expect(Object.keys(result)).toEqual([
        'id',
        'name',
        'email',
        'lastLogin',
        'createdAt',
        'updatedAt',
      ]);
    });
  });
});
