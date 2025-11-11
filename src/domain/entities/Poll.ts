import PollTypes from '../enums/PollTypes';
import PollOption from './PollOption';
import User from './User';

export default class Poll {
  constructor(props?: Partial<Poll>) {
    Object.assign(this, props);
  }

  id: string;

  title: string;

  description: string;

  type: PollTypes;

  options: PollOption[];

  creator: User;

  createdAt: Date;

  updatedAt?: Date;
}
