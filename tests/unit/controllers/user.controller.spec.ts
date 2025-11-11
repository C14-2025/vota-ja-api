import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import UserController from '~/nestjs/controllers/user.controller';
import UserService from '~/nestjs/services/user.service';
import UserResponseDTO from '~/infra/dtos/user/UserResponseDTO';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedUser: UserResponseDTO = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      };

      mockUserService.getAllUsers.mockResolvedValue([expectedUser]);

      const result = await controller.getAllUsers();

      expect(result).toEqual([expectedUser]);
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create and return the new user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const createBody = {
        name: 'Alice Example',
        email: 'alice@example.com',
        password: 'senhaSegura123',
      } as any;

      const expectedUser: UserResponseDTO = {
        id: userId,
        name: createBody.name,
        email: createBody.email,
        createdAt: new Date('2023-10-11T10:00:00.000Z'),
        updatedAt: new Date('2023-10-11T10:00:00.000Z'),
      };

      mockUserService.createUser.mockResolvedValue(expectedUser);

      const result = await controller.createUser(createBody);

      expect(result).toEqual(expectedUser);
      expect(userService.createUser).toHaveBeenCalledWith(createBody);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedUser: UserResponseDTO = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2023-10-10T10:00:00.000Z'),
        updatedAt: new Date('2023-10-10T10:00:00.000Z'),
      };

      mockUserService.getUserById.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(userService.getUserById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockUserService.getUserById.mockRejectedValue(
        new NotFoundException(`User with ID ${userId} not found`),
      );

      // Act & Assert
      await expect(controller.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(userService.getUserById).toHaveBeenCalledTimes(1);
    });
  });
});
