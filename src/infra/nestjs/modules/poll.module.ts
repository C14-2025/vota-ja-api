import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PollModel from '~/infra/databases/models/Poll';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import PollService from '../services/poll.service';
import PollController from '../controllers/poll.controller';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import UserModel from '~/infra/databases/models/User';

export const POLL_REPOSITORY_TOKEN = 'IPollRepository';

@Module({
  imports: [TypeOrmModule.forFeature([PollModel, UserModel])],
  controllers: [PollController],
  providers: [
    PollService,
    PollRepository,
    UserRepository,
    {
      provide: POLL_REPOSITORY_TOKEN,
      useClass: PollRepository,
    },
  ],
  exports: [PollService, POLL_REPOSITORY_TOKEN],
})
export default class PollModule {}
