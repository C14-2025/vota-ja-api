import PollOption from '~/domain/entities/PollOption';
import WeakEntityBaseModel from './WeakEntityBase';
import Poll from '~/domain/entities/Poll';
import BaseModel from './Base';
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import PollModel from './Poll';

@Entity('poll_options')
export default class PollOptionModel extends BaseModel implements PollOption {
  @ManyToOne(() => PollModel, {
    nullable: false,
  })
  @JoinColumn({ name: 'poll_id' })
  poll: Relation<Poll>;

  @Column()
  text: string;
}
