import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import VoteModel from '~/infra/databases/models/Vote';
import VoteRepository from '~/infra/databases/typeorm/repositories/vote.repository';
import VoteService from '../services/vote.service';
import VoteController from '../controllers/vote.controller';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import UserModel from '~/infra/databases/models/User';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import PollModel from '~/infra/databases/models/Poll';
import PollOptionRepository from '~/infra/databases/typeorm/repositories/poll-option.repository';
import PollOptionModel from '~/infra/databases/models/PollOption';
import PollModule from './poll.module';

export const VOTE_REPOSITORY_TOKEN = 'IVoteRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VoteModel,
      UserModel,
      PollModel,
      PollOptionModel,
    ]),
    PollModule,
  ],
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteRepository,
    UserRepository,
    PollRepository,
    PollOptionRepository,
    {
      provide: VOTE_REPOSITORY_TOKEN,
      useClass: VoteRepository,
    },
  ],
  exports: [VoteService, VOTE_REPOSITORY_TOKEN],
})
export default class VoteModule {}
