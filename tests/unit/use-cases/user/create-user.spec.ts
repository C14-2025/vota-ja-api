import CreateUserUseCase from '../../../../src/domain/use-cases/user/create-user';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import User from '../../../../src/domain/entities/User';
import ICreateUserDTO from '../../../../src/domain/interfaces/dtos/user/ICreateUserDTO';
import { HashGenerator } from '../../../../src/domain/cryptography/hash-generator';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashGenerator: jest.Mocked<HashGenerator>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    hashGenerator = {
      hash: jest.fn(),
    } as unknown as jest.Mocked<HashGenerator>;

    createUserUseCase = new CreateUserUseCase(userRepository, hashGenerator);
  });

  describe('execute', () => {
    beforeEach(() => {
      hashGenerator.hash.mockResolvedValue('hashedPassword123');
    });

    const mockCreateUserDTO: ICreateUserDTO = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
    };

    const mockCreatedUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword123',
      createdAt: new Date('2023-10-10T10:00:00.000Z'),
      updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      lastLogin: undefined,
    };

    it('should create a user successfully', async () => {
      userRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await createUserUseCase.execute(mockCreateUserDTO);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockCreateUserDTO.name,
          email: mockCreateUserDTO.email,
          password: mockCreateUserDTO.password,
        }),
      );

      expect(result).toEqual({
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        lastLogin: mockCreatedUser.lastLogin,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
    });

    it('should create a user without lastLogin', async () => {
      const userWithoutLastLogin = {
        ...mockCreatedUser,
        lastLogin: undefined,
      };

      userRepository.create.mockResolvedValue(userWithoutLastLogin);

      const result = await createUserUseCase.execute(mockCreateUserDTO);

      expect(result.lastLogin).toBeUndefined();
      expect(result.id).toBe(mockCreatedUser.id);
      expect(result.name).toBe(mockCreatedUser.name);
      expect(result.email).toBe(mockCreatedUser.email);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection error');
      userRepository.create.mockRejectedValue(error);

      await expect(
        createUserUseCase.execute(mockCreateUserDTO),
      ).rejects.toThrow('Database connection error');

      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle user creation with all fields', async () => {
      const userWithLastLogin = {
        ...mockCreatedUser,
        lastLogin: new Date('2023-10-15T14:30:00.000Z'),
      };

      userRepository.create.mockResolvedValue(userWithLastLogin);

      const result = await createUserUseCase.execute(mockCreateUserDTO);

      expect(result).toEqual({
        id: userWithLastLogin.id,
        name: userWithLastLogin.name,
        email: userWithLastLogin.email,
        lastLogin: userWithLastLogin.lastLogin,
        createdAt: userWithLastLogin.createdAt,
        updatedAt: userWithLastLogin.updatedAt,
      });
    });
  });
});
