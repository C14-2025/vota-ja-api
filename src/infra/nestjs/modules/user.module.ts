import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModel from '~/infra/databases/models/User';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import UserService from '../services/user.service';
import UserController from '../controllers/user.controller';

export const USER_REPOSITORY_TOKEN = 'IUserRepository';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY_TOKEN],
})
export default class UserModule {}
