import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../../config';
import UserModel from '../models/User';
import PollModel from '../models/Poll';
import PollOptionModel from '../models/PollOption';
import VoteModel from '../models/Vote';

export default TypeOrmModule.forRoot({
  ...config.typeOrmDb,
  entities: [UserModel, PollModel, PollOptionModel, VoteModel],
});
