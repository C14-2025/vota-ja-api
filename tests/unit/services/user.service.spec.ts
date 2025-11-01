import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import UserService from '~/nestjs/services/user.service';
import { IUserRepository } from '~/domain/types/repositories/IUserRepository';
import { USER_REPOSITORY_TOKEN } from '~/nestjs/modules/user.module';
import User from '~/domain/entities/User';

describe('UserService', () => {
  let service: UserService;
  let userRepository: IUserRepository;

  const mockUserRepository = {
    getById: jest.fn(),
    create: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<IUserRepository>(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user response DTO when user is found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser: User = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123',
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
        lastLogin: new Date('2023-10-09T15:30:00.000Z'),
      };

      mockUserRepository.getById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        lastLogin: mockUser.lastLogin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
      expect(userRepository.getById).toHaveBeenCalledWith(userId);
      expect(userRepository.getById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockUserRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
      expect(userRepository.getById).toHaveBeenCalledWith(userId);
      expect(userRepository.getById).toHaveBeenCalledTimes(1);
    });

    it('should not return password in response DTO', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser: User = {
        id: userId,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'secretPassword123',
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      };

      mockUserRepository.getById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('getAllUsers', () => {
    it('should return mapped users array', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174010';
      const mockUser: User = {
        id: userId,
        name: 'List User',
        email: 'list.user@example.com',
        password: 'pw',
        createdAt: new Date('2023-10-12T10:00:00.000Z'),
        updatedAt: new Date('2023-10-12T10:00:00.000Z'),
      };

      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        lastLogin: mockUser.lastLogin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result[0]).not.toHaveProperty('password');
      expect(userRepository['findAll']).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create a new user and return mapped DTO', async () => {
      const payload: Partial<User> = {
        name: 'New User',
        email: 'new.user@example.com',
        password: 'newPassword',
      };

      const createdUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174011',
        name: payload.name,
        email: payload.email,
        password: payload.password,
        createdAt: new Date('2023-10-13T10:00:00.000Z'),
        updatedAt: new Date('2023-10-13T10:00:00.000Z'),
      } as User;

      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await service.createUser(payload);

      expect(result).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        lastLogin: createdUser.lastLogin,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });

      expect(userRepository['create']).toHaveBeenCalledTimes(1);
      expect(userRepository['create']).toHaveBeenCalledWith(expect.objectContaining({
        name: payload.name,
        email: payload.email,
      }));
    });
  });
});
