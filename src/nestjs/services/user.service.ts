import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '~/domain/types/repositories/IUserRepository';
import User from '~/domain/entities/User';
import UserResponseDTO from '~/dtos/user/UserResponseDTO';
import { USER_REPOSITORY_TOKEN } from '../modules/user.module';

@Injectable()
export default class UserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.getById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUserToResponseDTO(user);
  }

  private mapUserToResponseDTO(user: User): UserResponseDTO {
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
