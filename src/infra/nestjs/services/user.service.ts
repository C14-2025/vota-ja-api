import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '~/domain/types/repositories/IUserRepository';
import User from '~/domain/entities/User';
import UserResponseDTO from '~/infra/dtos/user/UserResponseDTO';

@Injectable()
export default class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(payload: Partial<User>): Promise<UserResponseDTO> {
    const userToCreate = new User(payload);
    const created = await this.userRepository.create(userToCreate);
    return this.mapUserToResponseDTO(created);
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.getById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUserToResponseDTO(user);
  }

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(u => this.mapUserToResponseDTO(u));
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
