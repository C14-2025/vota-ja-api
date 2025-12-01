import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';
import UserAlreadyExistsError from '~/domain/errors/UserAlreadyExistsError';
import CreateUserUseCase from '~/domain/use-cases/user/create-user';
import GetUserByIdUseCase from '~/domain/use-cases/user/get-user-by-id';
import GetAllUsersUseCase from '~/domain/use-cases/user/get-all-users';
import ICreateUserDTO from '~/domain/interfaces/dtos/user/ICreateUserDTO';
import UserResponseDTO from '~/infra/dtos/user/UserResponseDTO';
import BcryptHasher from '~/infra/cryptography/bcrypt-hasher';

@Injectable()
export default class UserService {
  createUserUseCase: CreateUserUseCase;

  getUserByIdUseCase: GetUserByIdUseCase;

  getAllUsersUseCase: GetAllUsersUseCase;

  constructor(private readonly userRepository: UserRepository) {
    this.createUserUseCase = new CreateUserUseCase(
      this.userRepository,
      new BcryptHasher(),
    );
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
  }

  async createUser(payload: ICreateUserDTO): Promise<UserResponseDTO> {
    try {
      return await this.createUserUseCase.execute(payload);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    try {
      return await this.getUserByIdUseCase.execute(id);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error);
    }
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    try {
      return await this.getAllUsersUseCase.execute();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
