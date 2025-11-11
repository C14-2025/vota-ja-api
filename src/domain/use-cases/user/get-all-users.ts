import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import IUserResponseDTO from '~/domain/interfaces/dtos/user/IUserResponseDTO';

export default class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<IUserResponseDTO[]> {
    const users = await this.userRepository.findAll();

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
