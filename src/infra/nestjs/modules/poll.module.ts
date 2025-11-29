import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PollModel from '~/infra/databases/models/Poll';
import PollRepository from '~/infra/databases/typeorm/repositories/poll.repository';
import PollService from '../services/poll.service';
import PollController from '../controllers/poll.controller';
import UserRepository from '~/infra/databases/typeorm/repositories/user.repository';
import UserModel from '~/infra/databases/models/User';
import VoteRepository from '~/infra/databases/typeorm/repositories/vote.repository';
import VoteModel from '~/infra/databases/models/Vote';
import { PollRealtimeAdapter } from '~/infra/websocket/poll-realtime-adapter';
import { PollGateway } from '~/infra/websocket/poll.gateway';

export const POLL_REPOSITORY_TOKEN = 'IPollRepository';

@Module({
  imports: [TypeOrmModule.forFeature([PollModel, UserModel, VoteModel])],
  controllers: [PollController],
  providers: [
    PollService,
    PollRepository,
    UserRepository,
    VoteRepository,
    PollRealtimeAdapter,
    PollGateway,
    {
      provide: POLL_REPOSITORY_TOKEN,
      useClass: PollRepository,
    },
  ],
  exports: [
    PollService,
    POLL_REPOSITORY_TOKEN,
    PollRealtimeAdapter,
    PollGateway,
  ],
})
export default class PollModule {}
