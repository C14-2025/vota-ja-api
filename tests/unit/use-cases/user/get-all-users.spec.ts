import GetAllUsersUseCase from '../../../../src/domain/use-cases/user/get-all-users';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import User from '../../../../src/domain/entities/User';

describe('GetAllUsersUseCase', () => {
  let getAllUsersUseCase: GetAllUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  });

  describe('execute', () => {
    const mockUsers: User[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123',
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
        lastLogin: new Date('2023-10-15T14:30:00.000Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'hashedPassword456',
        createdAt: new Date('2023-10-11T11:00:00.000Z'),
        updatedAt: new Date('2023-10-11T11:00:00.000Z'),
        lastLogin: undefined,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'hashedPassword789',
        createdAt: new Date('2023-10-12T12:00:00.000Z'),
        updatedAt: new Date('2023-10-12T12:00:00.000Z'),
        lastLogin: new Date('2023-10-16T15:45:00.000Z'),
      },
    ];

    it('should get all users successfully', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await getAllUsersUseCase.execute();

      expect(userRepository.findAll).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          id: mockUsers[0].id,
          name: mockUsers[0].name,
          email: mockUsers[0].email,
          lastLogin: mockUsers[0].lastLogin,
          createdAt: mockUsers[0].createdAt,
          updatedAt: mockUsers[0].updatedAt,
        },
        {
          id: mockUsers[1].id,
          name: mockUsers[1].name,
          email: mockUsers[1].email,
          lastLogin: mockUsers[1].lastLogin,
          createdAt: mockUsers[1].createdAt,
          updatedAt: mockUsers[1].updatedAt,
        },
        {
          id: mockUsers[2].id,
          name: mockUsers[2].name,
          email: mockUsers[2].email,
          lastLogin: mockUsers[2].lastLogin,
          createdAt: mockUsers[2].createdAt,
          updatedAt: mockUsers[2].updatedAt,
        },
      ]);
    });

    it('should return empty array when no users exist', async () => {
      userRepository.findAll.mockResolvedValue([]);

      const result = await getAllUsersUseCase.execute();

      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should not include password in any user response', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await getAllUsersUseCase.execute();

      result.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(Object.keys(user)).toEqual([
          'id',
          'name',
          'email',
          'lastLogin',
          'createdAt',
          'updatedAt',
        ]);
      });
    });

    it('should handle users with and without lastLogin', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await getAllUsersUseCase.execute();

      expect(result[0].lastLogin).toBeDefined();
      expect(result[1].lastLogin).toBeUndefined();
      expect(result[2].lastLogin).toBeDefined();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection error');
      userRepository.findAll.mockRejectedValue(error);

      await expect(getAllUsersUseCase.execute()).rejects.toThrow(
        'Database connection error',
      );

      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle single user array', async () => {
      const singleUser = [mockUsers[0]];
      userRepository.findAll.mockResolvedValue(singleUser);

      const result = await getAllUsersUseCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockUsers[0].id);
      expect(result[0].name).toBe(mockUsers[0].name);
      expect(result[0].email).toBe(mockUsers[0].email);
    });

    it('should correctly map all user fields', async () => {
      userRepository.findAll.mockResolvedValue([mockUsers[0]]);

      const result = await getAllUsersUseCase.execute();

      const user = result[0];
      expect(user.id).toBe(mockUsers[0].id);
      expect(user.name).toBe(mockUsers[0].name);
      expect(user.email).toBe(mockUsers[0].email);
      expect(user.lastLogin).toEqual(mockUsers[0].lastLogin);
      expect(user.createdAt).toEqual(mockUsers[0].createdAt);
      expect(user.updatedAt).toEqual(mockUsers[0].updatedAt);
    });
  });
});
