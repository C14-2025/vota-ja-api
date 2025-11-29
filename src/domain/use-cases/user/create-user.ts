import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import ICreateUserDTO from '~/domain/interfaces/dtos/user/ICreateUserDTO';
import IUserResponseDTO from '~/domain/interfaces/dtos/user/IUserResponseDTO';
import User from '~/domain/entities/User';
import { HashGenerator } from '~/domain/cryptography/hash-generator';
import UserAlreadyExistsError from '~/domain/errors/UserAlreadyExistsError';

export default class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute(payload: ICreateUserDTO): Promise<IUserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const userData = { ...payload };

    userData.password = await this.hashGenerator.hash(payload.password);

    const userToCreate = new User(userData);
    const created = await this.userRepository.create(userToCreate);

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      lastLogin: created.lastLogin,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}
