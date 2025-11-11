import AuthenticateUseCase from '../../../../src/domain/use-cases/auth/authenticate';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/IUserRepository';
import { HashComparer } from '../../../../src/domain/cryptography/hash-comparer';
import { Encrypter } from '../../../../src/domain/cryptography/encrypter';
import WrongCredentialsError from '../../../../src/domain/errors/WrongCredentialsError';
import User from '../../../../src/domain/entities/User';

describe('AuthenticateUseCase', () => {
  let authenticateUseCase: AuthenticateUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashComparer: jest.Mocked<HashComparer>;
  let encrypter: jest.Mocked<Encrypter>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    hashComparer = {
      compare: jest.fn(),
    } as jest.Mocked<HashComparer>;

    encrypter = {
      encrypt: jest.fn(),
    } as jest.Mocked<Encrypter>;

    authenticateUseCase = new AuthenticateUseCase(
      userRepository,
      hashComparer,
      encrypter,
    );
  });

  describe('validateUser', () => {
    it('should return false when email is empty', async () => {
      const result = await authenticateUseCase.validateUser('', 'password');
      expect(result).toBe(false);
    });

    it('should return false when password is empty', async () => {
      const result = await authenticateUseCase.validateUser(
        'email@test.com',
        '',
      );
      expect(result).toBe(false);
    });

    it('should return true when email and password are provided', async () => {
      const result = await authenticateUseCase.validateUser(
        'email@test.com',
        'password',
      );
      expect(result).toBe(true);
    });
  });

  describe('execute', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
    } as User;

    const authData = {
      email: 'test@example.com',
      password: 'plainPassword',
    };

    it('should authenticate user successfully', async () => {
      const accessToken = 'mock-access-token';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      encrypter.encrypt.mockResolvedValue(accessToken);

      const result = await authenticateUseCase.execute(authData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(authData.email);
      expect(hashComparer.compare).toHaveBeenCalledWith(
        authData.password,
        mockUser.password,
      );
      expect(encrypter.encrypt).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });

      expect(result).toEqual({
        accessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });

    it('should throw WrongCredentialsError when user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authenticateUseCase.execute(authData)).rejects.toThrow(
        WrongCredentialsError,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(authData.email);
      expect(hashComparer.compare).not.toHaveBeenCalled();
      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });

    it('should throw WrongCredentialsError when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(false);

      await expect(authenticateUseCase.execute(authData)).rejects.toThrow(
        WrongCredentialsError,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(authData.email);
      expect(hashComparer.compare).toHaveBeenCalledWith(
        authData.password,
        mockUser.password,
      );
      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });
  });
});
