import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserModel from '~/databases/models/User';
import User from '~/domain/entities/User';
import { IUserRepository } from '~/domain/types/repositories/IUserRepository';

@Injectable()
export default class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async create(user: User): Promise<User> {
    const savedUserModel = await this.userRepository.save(user);
    return savedUserModel;
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (user == null) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user == null) {
      return null;
    }

    return user;
  }
}
