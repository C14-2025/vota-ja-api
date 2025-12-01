import Poll from '~/domain/entities/Poll';
import User from '~/domain/entities/User';
import PollTypes from '~/domain/enums/PollTypes';
import { PollStatus } from '~/domain/enums/PollStatus';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import PollOption from '~/domain/entities/PollOption';
import BaseModel from './Base';
import UserModel from './User';
import PollOptionModel from './PollOption';

@Entity('polls')
export default class PollModel extends BaseModel implements Poll {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column('enum', { enum: PollTypes })
  type: PollTypes;

  @Column('enum', { enum: PollStatus, default: PollStatus.OPEN })
  status: PollStatus;

  @OneToMany(() => PollOptionModel, option => option.poll, { cascade: true })
  options: Relation<PollOption[]>;

  @ManyToOne(() => UserModel, {
    nullable: false,
  })
  @JoinColumn({ name: 'creator_id' })
  creator: Relation<User>;
}
