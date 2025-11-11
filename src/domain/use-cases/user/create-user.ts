import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import ICreateUserDTO from '~/domain/interfaces/dtos/user/ICreateUserDTO';
import IUserResponseDTO from '~/domain/interfaces/dtos/user/IUserResponseDTO';
import User from '~/domain/entities/User';

export default class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(payload: ICreateUserDTO): Promise<IUserResponseDTO> {
    const userToCreate = new User(payload);
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
