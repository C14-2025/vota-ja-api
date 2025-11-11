import { IUserRepository } from '~/domain/interfaces/repositories/IUserRepository';
import IUserResponseDTO from '~/domain/interfaces/dtos/user/IUserResponseDTO';
import UserNotFoundError from '~/domain/errors/UserNotFoundError';

export default class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<IUserResponseDTO> {
    const user = await this.userRepository.getById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
