import Votes from '~/domain/entities/Vote';
import User from '~/domain/entities/User';
import Poll from '~/domain/entities/Poll';
import PollOption from '~/domain/entities/PollOption';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  Relation,
  Index,
  PrimaryColumn,
} from 'typeorm';
import UserModel from './User';
import PollModel from './Poll';
import PollOptionModel from './PollOption';
import WeakEntityBaseModel from './WeakEntityBase';

@Entity('votes')
@Index(['voter', 'poll'], { unique: true })
export default class VoteModel extends WeakEntityBaseModel implements Votes {
  @PrimaryColumn({ name: 'voter_id' })
  voterId: string;

  @ManyToOne(() => UserModel, {
    nullable: false,
  })
  @JoinColumn({ name: 'voter_id' })
  voter: Relation<User>;

  @PrimaryColumn({ name: 'poll_id' })
  pollId: string;

  @ManyToOne(() => PollModel, {
    nullable: false,
  })
  @JoinColumn({ name: 'poll_id' })
  poll: Relation<Poll>;

  @ManyToOne(() => PollOptionModel, {
    nullable: false,
  })
  @JoinColumn({ name: 'option_id' })
  option: Relation<PollOption>;
}
